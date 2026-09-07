# Especificación: base de datos Neon PostgreSQL

**Última actualización:** 2026-08-22

## 1. Arquitectura

Neon aloja tanto los datos de producto como las tablas gestionadas de Neon Auth. Expo no
abre conexiones PostgreSQL:

```text
Expo + Zustand + AsyncStorage
      ├─ autenticación ──> Neon Auth
      └─ sync HTTPS ──> Express ──> Neon PostgreSQL
                              ↑
                       JWT verificado de Neon Auth
```

La copia local permite abrir y editar la colección sin conexión. Cuando vuelve la red y
hay sesión, se reconcilia con las tablas remotas. Los tombstones existen para que un
borrado offline se propague; no son un sustituto de la tabla de datos.

## 2. Propiedad de los esquemas

- `neon_auth.*`: gestionado por Neon Auth. No crear, alterar ni borrar sus tablas desde la
  aplicación.
- `public.user_items`, `public.user_labels`, `public.sync_tombstones`: datos de Retiva.
- Las filas privadas usan `user_id UUID` con foreign key a
  `neon_auth."user"(id) ON DELETE CASCADE`.
- No existen `public.users` ni `public.refresh_tokens`.

## 3. Esquema de producto

El DDL idempotente de `server/db.ts` comprueba primero que Neon Auth esté provisionado y
crea:

```sql
CREATE TABLE IF NOT EXISTS user_items (
  id VARCHAR(100) NOT NULL,
  user_id UUID NOT NULL,
  place_id VARCHAR(255) NOT NULL,
  external_data JSONB NOT NULL,
  personal_data JSONB NOT NULL,
  category_ids TEXT[] NOT NULL DEFAULT '{}',
  sources JSONB NOT NULL DEFAULT '[]',
  instagram_publications JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, id),
  CONSTRAINT user_items_neon_auth_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES neon_auth."user"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_labels (
  id VARCHAR(100) NOT NULL,
  user_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  category_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, id),
  CONSTRAINT user_labels_neon_auth_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES neon_auth."user"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sync_tombstones (
  user_id UUID NOT NULL,
  entity_type VARCHAR(10) NOT NULL CHECK (entity_type IN ('item', 'label')),
  entity_id VARCHAR(100) NOT NULL,
  deleted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, entity_type, entity_id),
  CONSTRAINT sync_tombstones_neon_auth_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES neon_auth."user"(id) ON DELETE CASCADE
);
```

Índices actuales:

- `user_items(user_id, place_id)`
- `user_items(user_id, updated_at DESC)`
- `user_labels(user_id)`
- `sync_tombstones(user_id, deleted_at DESC)`

## 4. Conexión del backend

`server/db.ts` crea un único `pg.Pool`, usa el endpoint pooled, TLS validado, channel
binding y límites de conexión/timeout. `normalizeConnectionString()` retira
`sslmode` y `channel_binding` de la URL porque se pasan como opciones explícitas a
`node-postgres`.

Reglas:

- `DATABASE_URL` solo existe en backend.
- No crear un pool por request.
- Todos los valores usan parámetros `$1`, `$2`, etc.
- No registrar credenciales, JWT ni payloads personales.
- Las operaciones multi-tabla usan `withTransaction()`.

## 5. Autorización e aislamiento

El cliente obtiene del SDK oficial un JWT temporal de Neon Auth y lo envía a Express.
`server/neonAuthService.ts` valida la firma EdDSA con `neon_auth.jwks` y entrega el
`sub` verificado. Cada consulta incluye:

```sql
WHERE user_id = $1
```

El backend nunca usa un `userId` incluido por el cliente. Neon Auth administra la sesión;
la API solo valida la autorización necesaria para acceder a los datos.

## 6. Sincronización y conflictos

- `GET /api/sync/data` devuelve items, labels y borrados del usuario autenticado.
- `POST /api/sync/push` acepta lotes parciales de hasta el límite del servicio.
- Los upserts usan la clave `(user_id, id)`.
- Una versión entrante solo sustituye la remota si su `updated_at` es posterior.
- La ausencia de una entidad en un payload parcial nunca implica borrado.
- Borrar una entidad elimina su fila y escribe un tombstone en la misma transacción.
- Un upsert solo puede recuperar una entidad si es posterior a `deleted_at`.

Este diseño mantiene la tabla principal sincronizada cuando hay internet y conserva una
señal mínima de eliminación para dispositivos que estuvieron offline.

## 7. Migraciones

`server/migrations/001_use_neon_auth.sql`:

1. verifica que exista `neon_auth."user"`;
2. se detiene si la antigua `public.users` contiene filas;
3. cambia las foreign keys de datos a Neon Auth;
4. elimina las tablas antiguas vacías `public.refresh_tokens` y `public.users`.

Las migraciones futuras deben ser SQL versionado, revisable y transaccional cuando sea
posible. No modificar una migración ya aplicada. Validar cambios destructivos en una rama
de Neon y ejecutar cada migración desde un único job de release.

## 8. Entorno

```bash
# Solo backend
DATABASE_URL=postgresql://<usuario>:<contraseña>@<endpoint-pooled>/<db>?sslmode=require
NEON_AUTH_BASE_URL=https://<endpoint-auth>/<db>/auth

# Cliente Expo
EXPO_PUBLIC_NEON_AUTH_URL=https://<endpoint-auth>/<db>/auth
EXPO_PUBLIC_API_PORT=8790
```

No existe `EXPO_PUBLIC_DATABASE_URL` ni `JWT_SECRET`.

## 9. Verificación

La prueba integral crea dos identidades temporales mediante Neon Auth, valida una firma
correcta y otra manipulada, comprueba aislamiento, upsert, borrado/tombstone y logout, y
elimina las identidades de prueba al terminar.

Comandos:

```bash
npm run check
npm run lint
npm test
npm run server:build
RUN_NEON_INTEGRATION=true npm run server:test
```

Referencias: [pooling de Neon](https://neon.tech/docs/connect/connection-pooling),
[branching](https://neon.tech/docs/introduction/branching) y
[SDK oficial de Neon Auth](https://github.com/neondatabase/neon-js/tree/main/packages/auth).
