# Prompt: implementar o ampliar autenticación con Neon Auth

Lee, en este orden:

1. `.ai/features/neon-authentification-system/auth-system-spec.md`
2. `.ai/features/neon-authentification-system/auth-system-implementation.md`
3. `.ai/features/neon-database/neon-database-spec.md`

## Requisitos

- Usa Neon Auth mediante el SDK oficial `@neondatabase/auth` como única fuente de
  identidad y sesión.
- No implementes hash de contraseñas, access/refresh tokens, rotación de tokens,
  `JWT_SECRET`, tablas públicas de usuarios ni endpoints propios `/api/auth/*`.
- Conserva la UI propia con los métodos de bajo nivel del adaptador vanilla.
- Zustand solo refleja perfil y estado de inicialización; no persistas credenciales de
  sesión manualmente.
- Para una API propia, pide el JWT transitorio al SDK justo antes de la llamada y valida
  su firma y claims contra las claves gestionadas de Neon Auth.
- Deriva siempre `user_id` del `sub` verificado, nunca del body o query string.
- No modifiques manualmente el esquema gestionado `neon_auth`.
- Mantén `DATABASE_URL` solo en backend. La URL de Neon Auth sí puede ser pública.
- Configura trusted origins y callbacks en Neon Console antes de añadir OAuth, correo o
  deep links.
- Respeta Expo Router, Zustand, i18next, accesibilidad y las convenciones del proyecto.

## Verificación y entrega

Añade pruebas de store y una prueba integral de Neon Auth + autorización + aislamiento de
datos. Ejecuta tipos, lint, tests de cliente y build/tests del servidor. Resume archivos,
migraciones y pasos manuales sin mostrar secretos.
