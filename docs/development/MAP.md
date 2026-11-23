# Mapa del repositorio

Índice para agentes. **Empieza aquí, identifica el flujo y abre solo los archivos de esa zona.**
No leas todos los documentos de `.ai/`: abre únicamente la especificación o skill que corresponda al cambio.

## Límites de lectura

- No recorras `node_modules/`, `.expo/`, `dist/`, `dist-server/`, `output/` ni `.playwright-cli/`: son dependencias, cachés o artefactos.
- `comidas/fotos/` contiene una colección grande de fotos y vídeos; consúltala solo si la tarea trata sobre esa galería o un asset concreto.
- `src/locales/` contiene cuatro idiomas y varios namespaces. Para cambios de traducción, abre solo el namespace afectado y sus equivalentes en los otros idiomas.
- En `.ai/features/`, elige el feature por tema; no cargues todos los prompts y especificaciones a la vez.
- Usa `rg -n "término" app src server api scripts` para seguir un comportamiento por nombre antes de abrir carpetas completas.

## Rutas por tipo de tarea

| Tarea | Empieza por | Sigue hacia | Contexto bajo demanda |
| --- | --- | --- | --- |
| Pantalla principal, navegación o tabs | `app/_layout.tsx`, `app/(tabs)/_layout.tsx`, ruta en `app/(tabs)/` | componentes `src/components/`, store o servicio usado por la pantalla | `.ai/skills/webapp-create-screen-default/` |
| Crear/editar receta | `app/(tabs)/create.tsx`, `app/recipe/edit/[id].tsx`, `src/components/RecipeEditor.tsx` | `src/stores/recipes.store.ts`, `src/services/recipes.service.ts`, `src/utils/recipeValidation.ts` | `.ai/skills/webapp-create-screen-products/` |
| Ver detalle de receta | `app/recipe/[id].tsx` | `src/components/Recipe*`, `src/stores/recipes.store.ts`, `src/services/recipes.service.ts` | — |
| Buscar o filtrar recetas | `app/(tabs)/search.tsx` | `src/utils/recipeSearch.ts`, store y componentes de tarjeta | — |
| Colecciones, favoritos o cuadrícula | `app/(tabs)/recipes.tsx` | `src/utils/recipeGrid.ts`, `src/utils/packGrid.ts`, `src/stores/recipes.store.ts`, tarjetas | — |
| Tamaño de tarjetas | `app/recipe/card-size.tsx` | `src/stores/recipeCardSizes.store.ts` y componentes que leen los tamaños | — |
| Asistente de recetas (UI) | `app/(tabs)/ai.tsx` | `src/services/assistant.service.ts` y componentes invocados | `.ai/features/openai-integration/` |
| Comportamiento del asistente en servidor | `server/ai.service.ts` | `server/index.ts`, acceso a datos y contrato enviado desde `src/services/assistant.service.ts` | `.ai/features/openai-integration/` |
| API HTTP | `api/[...path].ts` | `server/index.ts` y la ruta concreta | Inspecciona `app.json` y scripts solo si afecta despliegue |
| Persistencia y acceso a recetas | `server/recipe.repository.ts`, `server/db.ts` | `server/migrations/` y `src/services/recipes.service.ts` | `.ai/features/supabase-database/` o `.ai/features/neon-database/`, según proveedor real |
| Subida o transformación de imágenes | `src/services/imageUpload.service.ts` | `src/services/binaryUpload.native.ts` / `.web.ts`, `server/storage.ts`, `src/components/RecipeEditor.tsx` | — |
| Idiomas, selector o traducciones | `src/utils/i18n.ts`, `src/context/LanguageContext.tsx` | `src/components/LanguageSelector.tsx`, `src/locales/<idioma>/<namespace>.json` | `.ai/features/language-system/` |
| Tema o colores | `src/constants/Colors.ts`, `tailwind.config.js` | componentes consumidores y layouts | `.ai/features/themes-system/` |
| Componente compartido | `src/components/<Componente>.tsx` | sus usos en `app/` y pruebas junto al componente | `.ai/skills/webapp-create-modal/` para modales |
| Validación de recetas | `src/utils/recipeValidation.ts` | editor, servicio y `src/types/recipe.ts` | Prueba correspondiente junto al utilitario |
| Assets de interfaz | referencias `require(...)` / imports en `app/` y `src/` | fichero concreto bajo `assets/` | No listes ni abras toda la galería `comidas/fotos/` |
| Galería local de `comidas` | `comidas/README.md` | `comidas/index.html`, `comidas/app.js`, `comidas/server.py`, estilos según el flujo | Es una herramienta independiente de la app Expo |
| Scripts de importación o soporte | script concreto en `scripts/` | consumidor/formatos de entrada y salida | No ejecutar scripts que suban o alteren datos sin que la tarea lo requiera |
| Tests | `*.test.ts(x)` junto al módulo afectado | implementación y dependencias inmediatas | `.ai/skills/webapp-testing/` si trata del flujo de pruebas |

## Mapa de código

```text
app/                         Rutas y pantallas Expo Router
  (tabs)/                    Inicio, recetas, búsqueda, creación, asistente
  recipe/                    Detalle, edición y configuración de tamaño
src/components/              UI reutilizable de recetas e ingredientes
src/stores/                  Estado cliente Zustand: recetas y tamaños de tarjeta
src/services/                API de recetas, asistente y subida de imágenes
src/utils/                    Búsqueda, validación, cuadrículas, i18n y logging
src/types/                    Modelos compartidos, incluido Recipe
src/locales/{es,en,fr,de}/   Traducciones por namespace
server/                       API Express, base de datos, repositorio, semillas y storage
server/migrations/            Migraciones SQL
api/                           Adaptador de rutas para el despliegue serverless
scripts/                       Importación, subida y validaciones
assets/                        Recursos estáticos de la aplicación
comidas/                       Galería web auxiliar independiente
.ai/features/                  Especificaciones funcionales por capacidad
.ai/skills/                    Procedimientos de trabajo reutilizables
```

## Propiedad de datos y flujos

- Para recetas, sigue la ruta completa solo en el alcance necesario: pantalla → store → servicio → API → repositorio/base de datos. No asumas que el store es persistencia remota.
- `src/types/recipe.ts` define el contrato de receta en cliente; compara con los DTOs/filas que usa `server/recipe.repository.ts` antes de cambiar campos.
- La selección de imagen tiene plataforma: `binaryUpload.native.ts` y `binaryUpload.web.ts` son implementaciones distintas detrás de un servicio común.
- Los cambios de interfaz deben respetar i18n y revisar las cuatro traducciones del namespace tocado.
- Los archivos `*.test.ts(x)` existentes son referencias de patrones locales; añade o modifica pruebas solo cuando lo requiera el cambio.
