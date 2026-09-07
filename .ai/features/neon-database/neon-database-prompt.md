# Prompt: implementar o ampliar la base de datos Neon

Lee primero `.ai/features/neon-database/neon-database-spec.md` y la documentación de
`neon-authentification-system`.

## Requisitos

- Mantén `DATABASE_URL` exclusivamente en Express y usa el endpoint pooled con TLS.
- Usa un único `pg.Pool`, consultas parametrizadas y transacciones para unidades
  multi-tabla.
- Usa `neon_auth."user"(id)` como identidad; no crees tablas propias de usuarios o
  sesiones y no alteres el esquema administrado por Neon Auth.
- Valida en backend el JWT emitido por Neon Auth y deriva `user_id` solo del claim
  `sub` verificado.
- Filtra todas las lecturas, upserts y borrados por `user_id`.
- Conserva la experiencia offline con Zustand/AsyncStorage y sincroniza mediante
  `/api/sync/data` y `/api/sync/push`.
- Mantén tombstones para propagar eliminaciones entre dispositivos desconectados y evita
  interpretar como borrado la ausencia en un payload parcial.
- Versiona cambios de esquema en `server/migrations/`; prueba operaciones destructivas en
  una rama de Neon.
- No registres credenciales, JWT ni datos personales completos.

## Entrega

Actualiza tipos y mapeos snake_case/camelCase, añade pruebas de autorización,
aislamiento, conflictos y borrados, y ejecuta tipos, lint, tests del cliente y
build/tests del servidor. Resume migraciones y pasos manuales sin mostrar secretos.
