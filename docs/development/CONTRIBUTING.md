# Guía de cambios

Usa este documento para orientar el trabajo y `MAP.md` para encontrar los archivos responsables. Las reglas generales están en la raíz, en `AGENTS.md`.

## Antes de editar

1. Clasifica la tarea con la tabla de `MAP.md` y lee únicamente el punto de entrada y sus dependencias directas.
2. Busca usos y comportamiento paralelo con `rg` para encontrar el dueño real del estado o la transformación.
3. Si existe una especificación aplicable en `.ai/features/` o una skill de `.ai/skills/`, lee solo esa carpeta/archivo relevante.
4. Comprueba `git status --short`; conserva los cambios preexistentes y no los atribuyas a la tarea.
5. Identifica las fronteras afectadas: cliente/servidor, web/nativo, API/persistencia o idiomas.

## Durante el cambio

- Resuelve el comportamiento en su capa responsable y reutiliza los contratos y servicios existentes.
- Mantén el cambio acotado a la petición; evita duplicar lógica o añadir otra fuente de verdad.
- No cambies esquema o forma de datos ni añadas dependencias salvo que la petición lo exija.
- En UI, conserva los patrones de NativeWind, accesibilidad e i18n del proyecto.
- En lógica de plataforma, sigue el selector de archivos `.native` / `.web` y no importes extensiones explícitas.
- Si un cambio cruza cliente y servidor, revisa ambos extremos del contrato y las rutas de API.

## Verificación disponible

Ejecuta solo las comprobaciones pertinentes al cambio, de acuerdo con la petición y las instrucciones del proyecto:

```powershell
npm run check
npm run lint
npm test -- --runInBand
npm run validate
npm run server:build
```

No todos los cambios necesitan todas las comprobaciones. El build del servidor puede generar `dist-server/`, que está ignorado. Para cambios visuales, comprueba el caso afectado en la app cuando el entorno permita reproducirlo y captura el resultado real.

## Entrega

Resume el comportamiento cambiado, enlaza los archivos afectados, indica comandos ejecutados y su resultado, y menciona las limitaciones concretas de verificación. No informes como comprobación una acción que no se ejecutó.
