# Implementación actual: Neon Auth

**Última actualización:** 2026-08-22

Esta es la fuente de verdad del sistema implementado. La autenticación está administrada
por Neon Auth; el backend propio solo autoriza la API de sincronización.

## Componentes

| Capa               | Archivo                        | Responsabilidad                                             |
| ------------------ | ------------------------------ | ----------------------------------------------------------- |
| Inicialización SDK | `src/lib/neonAuth.ts`          | Crea una única instancia oficial de Neon Auth               |
| Servicio cliente   | `src/services/auth.service.ts` | Registro, login, sesión, perfil, contraseña y logout        |
| Estado             | `src/stores/auth.store.ts`     | Refleja usuario, carga e inicialización; no persiste tokens |
| Sincronización     | `src/services/sync.service.ts` | Obtiene un JWT transitorio y llama a `/api/sync/*`          |
| Guard de rutas     | `app/_layout.tsx`              | Inicializa sesión y protege grupos de Expo Router           |
| Verificación API   | `server/neonAuthService.ts`    | Verifica JWT EdDSA contra `neon_auth.jwks`                  |
| API                | `server/index.ts`              | Protege exclusivamente las rutas privadas de datos          |
| Esquema            | `server/db.ts`                 | Crea tablas de producto enlazadas a `neon_auth."user"`      |

## SDK y sesión

La dependencia está fijada a la línea beta oficial `@neondatabase/auth`. Se usa el
adaptador vanilla y sus métodos de bajo nivel para conservar la UI React Native propia:

- `signUp.email`
- `signIn.email`
- `getSession`
- `updateUser`
- `changePassword`
- `signOut`
- `getJWTToken`

El SDK gestiona cookie, caché, deduplicación y renovación. Zustand no contiene `token` ni
`refreshToken`, y no existe una clave de sesión propia en AsyncStorage.

## API de autenticación

No hay endpoints `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`,
`/api/auth/me` ni `/api/auth/logout` en Express. Esas operaciones van directamente al
endpoint público de Neon Auth.

Las únicas rutas propias que requieren identidad actualmente son:

| Método | Ruta             | Autorización                     |
| ------ | ---------------- | -------------------------------- |
| GET    | `/api/sync/data` | Bearer JWT emitido por Neon Auth |
| POST   | `/api/sync/push` | Bearer JWT emitido por Neon Auth |

`requireAuth` valida el token de forma asíncrona y añade a la request únicamente el UUID
del claim `sub` verificado.

## Verificación del backend

`server/neonAuthService.ts`:

1. exige un JWT de tres partes y algoritmo `EdDSA`;
2. carga las JWK activas de `neon_auth.jwks` y las convierte con `node:crypto`;
3. verifica la firma sin secretos compartidos;
4. comprueba issuer y audience contra el origen de `NEON_AUTH_BASE_URL`;
5. comprueba caducidad, `nbf`, UUID de `sub` y que el usuario no esté marcado como
   bloqueado;
6. devuelve el UUID que se aplica a todas las consultas.

Las claves se cachean durante cinco minutos. No se registra el JWT.

## Base de datos

Las identidades viven en el esquema administrado `neon_auth`. Las tablas de producto son
`public.user_items`, `public.user_labels` y `public.sync_tombstones`, todas con foreign
key a `neon_auth."user"(id) ON DELETE CASCADE`.

La migración `server/migrations/001_use_neon_auth.sql` retiró las tablas propias vacías
`public.users` y `public.refresh_tokens`. Si una instalación antigua contiene usuarios,
la migración se detiene para exigir un mapeo explícito en lugar de perder identidades.

## Variables de entorno

```bash
EXPO_PUBLIC_NEON_AUTH_URL=https://<endpoint-auth>/<db>/auth
NEON_AUTH_BASE_URL=https://<endpoint-auth>/<db>/auth
DATABASE_URL=postgresql://<credenciales>@<endpoint-pooled>/<db>?sslmode=require
EXPO_PUBLIC_API_PORT=8790
PORT=8790
```

Solo la URL de Auth es pública. La cadena PostgreSQL permanece en el backend.

## Configuración actual y ampliaciones

Email/password y signup están habilitados. La verificación obligatoria de email no está
activada. Antes de añadir OAuth, reset de contraseña o confirmación por deep link hay que
configurar proveedores, correo, trusted origins y callbacks en Neon Console, y después
crear las pantallas correspondientes.

## Pruebas

- `src/stores/auth.store.test.ts`: estado del usuario sin persistencia propia de tokens.
- `server/neon.integration.test.ts`: alta real con Neon Auth, firma válida/manipulada,
  aislamiento, sync, tombstones y logout.
- El test real se activa con `RUN_NEON_INTEGRATION=true npm --prefix server test`.
