# Decisiones de desarrollo

Memoria breve para explicar una elección técnica no obvia o una trampa repetible. No es un diario de trabajo, un backlog ni una copia de `AGENTS.md`.

Añade una nota solo cuando ayude a entender por qué se eligió una alternativa frente a otra o evite repetir una confusión técnica. Mantén cada nota en una o dos frases.

---

## Decisiones registradas

### Galería «Mis recetas 2»

Se descartó un carrusel con celdas virtualizadas y animadas porque mantenía tirones y retraso de foco en Android; conservar la lista plana en esa pantalla.

### Carga de imágenes multiplataforma

En nativo, `Image.getSize(uri)` devuelve una promesa; React Native Web requiere callbacks de éxito y error aunque los tipos compartidos sugieran la firma de promesa.

### Rutas largas al compilar Android en Windows

Si Ninja falla con `Filename longer than 260 characters`, compilar desde un staging de CMake corto y fijar `CMAKE_OBJECT_PATH_MAX=235` en el proyecto Android generado; puede hacerse en una copia temporal.
