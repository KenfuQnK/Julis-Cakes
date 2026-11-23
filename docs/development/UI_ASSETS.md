# Índice de assets de interfaz

Consulta este índice para localizar recursos estáticos de la interfaz sin recorrer carpetas de fotos de usuario.

## Assets referenciados por la app

| Uso | Archivo | Referencia |
| --- | --- | --- |
| Cabecera de la colección de recetas | `assets/images/recipe-collection-header.png` | `app/(tabs)/recipes.tsx` |
| Degradado/overlay para tarjeta de colección | `assets/images/recipe-card-fade.png` | `src/components/CollectionRecipeCard.tsx` |

Los archivos `*.bkp.*` son copias de respaldo, no recursos de runtime salvo que exista una referencia explícita en el código.

## Imágenes de recetas

- Las imágenes de recetas se resuelven normalmente por `imageUri` y el componente `src/components/RecipeImage.tsx`, con un placeholder en `src/components/RecipeImagePlaceholder.tsx`.
- La selección y subida se coordinan desde `src/components/RecipeEditor.tsx` y `src/services/imageUpload.service.ts`; el transporte binario cambia por plataforma.
- `comidas/fotos/` es contenido de la galería auxiliar. No es el catálogo de assets estáticos de la app y no debe indexarse completo para una tarea normal.

## Añadir o sustituir un recurso

Coloca el recurso en `assets/` según su función, actualiza la referencia del consumidor existente y busca otras referencias con `rg -n "nombre-del-archivo" app src`. No copies imágenes a otra carpeta si se puede reutilizar el asset existente.
