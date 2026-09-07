# Especificación: autenticación administrada con Neon Auth

**Última actualización:** 2026-08-22

## 1. Arquitectura elegida

La identidad y las sesiones pertenecen a **Neon Auth**, construido sobre Better Auth. La
aplicación usa el SDK oficial `@neondatabase/auth` y no implementa hashes de contraseña,
refresh tokens ni firma de tokens propios.

```text
Expo / React Native / web
  ├─ registro, login, perfil y logout ──> Neon Auth
  └─ sincronización ──> API Express ──> Neon PostgreSQL
                            ↑
                    identidad verificada de Neon Auth
```

Neon Auth mantiene usuarios, cuentas, sesiones y claves públicas en el esquema gestionado
`neon_auth`. Ese esquema no se modifica desde migraciones de la aplicación. Las tablas de
producto referencian `neon_auth."user"(id)`.

## 2. Responsabilidades

### Neon Auth

- Registro e inicio de sesión con email y contraseña.
- Hash y política de contraseñas.
- Creación, persistencia, renovación y revocación de sesiones.
- Perfil básico: nombre, email, avatar y estado de verificación.
- Cambio de contraseña.
- Emisión de un JWT de corta duración para autorizar la API de datos.
- Mantenimiento de las claves de verificación en `neon_auth.jwks`.

### Cliente Expo

- Presenta formularios propios accesibles y traducidos.
- Llama a Neon Auth mediante métodos de bajo nivel del SDK oficial.
- Mantiene en Zustand únicamente el perfil y estados de UI.
- No guarda access tokens, refresh tokens ni credenciales de Neon PostgreSQL.
- Solicita al SDK un JWT solo cuando necesita llamar a `/api/sync/*`.

### Backend Express

- No expone rutas `/api/auth/*`.
- No recibe contraseñas y no crea sesiones.
- Verifica la firma y claims del JWT emitido por Neon Auth.
- Deriva `userId` del claim `sub`; nunca acepta un identificador alternativo enviado por
  el cliente.
- Filtra todas las operaciones privadas por ese `userId`.

## 3. Flujos

### Registro

1. La pantalla valida nombre, email, contraseña, confirmación y términos.
2. `authService.register()` ejecuta `auth.signUp.email(...)`.
3. Neon Auth crea la identidad y la sesión.
4. El cliente obtiene el perfil con `getSession()` y Zustand marca la sesión como activa.

### Login y restauración

1. `authService.login()` ejecuta `auth.signIn.email(...)`.
2. Al montar la aplicación, `useAuthStore.init()` llama a `getSession()`.
3. El SDK y Neon Auth gestionan la cookie, caché y renovación de sesión.
4. Si no existe una sesión válida, el store queda en modo no autenticado.

No existe lógica propia de rotación ni persistencia de tokens en AsyncStorage.

### Logout

`auth.signOut()` revoca la sesión administrada. El store limpia siempre el perfil local,
incluso si la red falla, para no dejar una UI autenticada de forma engañosa.

### Perfil y contraseña

- `auth.updateUser({ name, image })` modifica el perfil.
- `auth.changePassword({ currentPassword, newPassword, revokeOtherSessions: true })`
  cambia la contraseña y revoca las demás sesiones.
- El idioma es una preferencia local de la app, no un campo de identidad.

### Sincronización autorizada

1. `sync.service.ts` pide `getJWTToken()` al SDK.
2. Envía el valor como `Authorization: Bearer <jwt>` únicamente a la API Express.
3. El backend valida EdDSA, firma, `iss`, `aud`, `exp`, `nbf`, `sub` y el estado
   `banned` con las claves de `neon_auth.jwks`.
4. La consulta usa el UUID validado como `user_id`.

Ese JWT es una credencial transitoria emitida y renovada por Neon Auth. La aplicación no
lo persiste ni implementa su ciclo de vida.

## 4. Estado del cliente

`src/stores/auth.store.ts` expone:

```ts
interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialized: boolean;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: ProfileUpdates) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}
```

No se crea un `AuthProvider`: Zustand refleja el usuario actual y el SDK es la fuente de
verdad de la sesión.

## 5. Navegación

El layout raíz ejecuta `init()`, espera a `initialized` y separa las rutas mediante
`Stack.Protected`:

- Sin sesión: `app/(auth)/*`.
- Con sesión: tabs, cuenta, cambio de contraseña y demás pantallas privadas.

Los hooks se declaran antes de cualquier retorno temprano. Los textos usan namespaces
i18next explícitos y todos los controles interactivos tienen etiquetas de accesibilidad.

## 6. Configuración

```bash
# Pública: endpoint de Neon Auth consumido por Expo
EXPO_PUBLIC_NEON_AUTH_URL=https://<endpoint>.neonauth.<region>.aws.neon.tech/<db>/auth

# Backend: misma URL, usada para calcular issuer y audience esperados
NEON_AUTH_BASE_URL=https://<endpoint>.neonauth.<region>.aws.neon.tech/<db>/auth

# Solo backend
DATABASE_URL=postgresql://<usuario>:<contraseña>@<endpoint-pooled>/<db>?sslmode=require
```

No existe `JWT_SECRET`. `DATABASE_URL` nunca lleva prefijo `EXPO_PUBLIC_`.

En Neon Console se deben configurar los orígenes web y callbacks/deep links de cada
entorno. Para activar verificación de email, OAuth o recuperación de contraseña hay que
configurar previamente el proveedor y sus URLs; no se simulan esos flujos en el cliente.

## 7. Seguridad y aceptación

- No almacenar tokens propios en Zustand, AsyncStorage ni tablas públicas.
- No consultar ni modificar manualmente tablas gestionadas de `neon_auth`, salvo leer las
  claves públicas desde el backend para verificar firmas.
- La API responde `401` ante sesión ausente/inválida y `503` si la verificación no está
  temporalmente disponible.
- Las claves públicas se cachean por un periodo corto y se vuelven a leer para admitir
  rotación de claves.
- CORS, límites de payload, HTTPS y rate limiting deben endurecerse al publicar.
- Las pruebas deben cubrir sesión administrada, token manipulado, aislamiento entre dos
  usuarios, logout y sincronización.
- Antes de entregar: `npm run check`, `npm run lint`, `npm test`,
  `npm run server:build` y `npm run server:test`.

Referencias: [SDK oficial @neondatabase/auth](https://github.com/neondatabase/neon-js/tree/main/packages/auth) y
[arquitectura de Neon Auth](https://neon.com/blog/neon-auth-branchable-identity-in-your-database).
