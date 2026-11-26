# Instrucciones para agentes

Esta guía contiene las reglas duraderas que aplican a todo el repositorio. Las rutas de código, el procedimiento de trabajo y las comprobaciones se mantienen en las guías especializadas enlazadas abajo.

## Contexto del proyecto

- Aplicación Expo con React Native, Expo Router, TypeScript estricto y NativeWind; debe funcionar en Android, iOS y web.
- El cliente vive principalmente en `app/` y `src/`; el backend HTTP y el acceso a datos viven en `server/` y `api/`.
- El proyecto usa Zustand para estado de cliente, i18next para traducciones y servicios propios para hablar con el backend. Comprueba el flujo existente antes de introducir otra solución.
- Las especificaciones de funcionalidades y los procedimientos particulares pueden estar en `.ai/features/` y `.ai/skills/`.

### Responsabilidad de cada capa

- `app/` contiene rutas, layouts y composición de pantallas de Expo Router. Mantén la lógica de dominio fuera de las rutas cuando ya exista un componente, hook, store o servicio responsable.
- `src/components/` contiene UI reutilizable; `src/hooks/` encapsula comportamiento React reutilizable; `src/utils/` contiene lógica pura que no depende de React ni de servicios.
- `src/stores/` contiene estado de cliente compartido, organizado por dominio. `src/services/` coordina acceso a API y servicios externos; `src/types/` define contratos compartidos.
- `server/` contiene la lógica del backend, acceso a datos y almacenamiento; `api/` adapta las rutas para el despliegue. No muevas reglas del servidor al cliente para evitar una validación o autorización del backend.
- Mantén juntos los módulos y pruebas relacionados siguiendo la ubicación que ya usa esa zona del repositorio; no crees una jerarquía de carpetas nueva por anticipado.

## Documentación de trabajo

- Empieza por [`docs/development/MAP.md`](docs/development/MAP.md) para encontrar los puntos de entrada y seguir el flujo afectado.
- Aplica [`docs/development/CONTRIBUTING.md`](docs/development/CONTRIBUTING.md) para el proceso, los límites de lectura y las comprobaciones.
- Consulta [`docs/development/DECISIONS.md`](docs/development/DECISIONS.md) para decisiones o limitaciones técnicas ya registradas.
- Usa [`docs/development/UI_ASSETS.md`](docs/development/UI_ASSETS.md) para localizar assets de interfaz.
- Lee solo el contexto de `.ai/` relacionado con la tarea; no cargues todas las especificaciones por defecto.
- Al editar prompts o instrucciones, define el comportamiento deseado con claridad; convierte el feedback en requisitos y no incorpores al texto el historial de diseño.

## Principios de implementación

- Entiende el comportamiento actual y localiza la capa responsable antes de editar. Corrige la causa en su dueño, no el síntoma en un consumidor.
- Sigue los contratos y patrones existentes. Mantén cada cambio acotado y evita lógica duplicada, fuentes de verdad paralelas y abstracciones sin un uso real.
- Conserva las fronteras entre interfaz, estado, servicios, API y persistencia; revisa ambos extremos cuando un cambio cruza una frontera.
- Mantén separado el estado local de pantalla, el estado compartido del cliente y los datos remotos. No dupliques en Zustand datos que ya gestione una caché remota.
- Prefiere `useState` para estado local simple y `useReducer` para transiciones locales relacionadas. Eleva estado solo cuando realmente lo compartan consumidores.
- Para estado compartido entre pantallas, crea o amplía un store Zustand pequeño y centrado en un dominio; consume propiedades con selectores específicos y deja sus acciones junto al estado.
- Reserva Context para providers que una librería o dependencia necesite. No lo uses como mecanismo nuevo para estado de producto.
- La respuesta remota debe tener un dueño claro en la capa de servicio o de caché del proyecto. El store de cliente puede guardar una selección o preferencia local, pero no una copia paralela de la respuesta.
- No cambies esquemas, contratos de datos o dependencias salvo que la petición lo necesite. Si una propuesta introduce un coste relevante de mantenimiento o seguridad, explica el impacto y usa una alternativa adecuada.
- No introduzcas credenciales ni secretos en el código. Valida los datos en las fronteras de entrada y no confíes en la validación del cliente como control del servidor.
- Antes de cambiar un campo, compara el tipo del cliente con el DTO, repositorio y persistencia que participan en el flujo; un cambio de forma de datos requiere coordinar esos límites.

## Convenciones del código

- Usa TypeScript y conserva el tipado estricto. Prefiere tipos concretos; usa `unknown` en fronteras no tipadas y evita `any` salvo que una limitación documentada lo justifique.
- En `app/`, usa `export default` para las rutas y layouts que Expo Router descubre. En el código de aplicación fuera de `app/`, usa named exports e imports con llaves.
- Usa el alias `@/` para imports desde la raíz cuando corresponda a la configuración del proyecto.
- Mantén las variantes de plataforma en archivos `.native.ts(x)` y `.web.ts(x)` cuando el comportamiento realmente difiera. No importes la extensión de plataforma explícitamente.
- Usa NativeWind y los patrones de estilo existentes en la interfaz. No añadas una segunda estrategia de estilos a un componente sin una razón concreta.
- Todo texto fijo visible debe pasar por i18next y sus archivos de idioma. Usa los namespaces del proyecto y conserva sincronizadas las traducciones equivalentes.
- Declara los namespaces al cargar traducciones y usa claves con namespace explícito. Al modificar textos, actualiza el mismo namespace en los idiomas disponibles y ejecuta la validación de traducciones correspondiente.
- Para comportamiento distinto por plataforma, usa el mecanismo de resolución de módulos configurado (`.native` / `.web`) detrás de una interfaz compartida; mantén la extensión fuera de los imports.
- Los controles interactivos deben tener nombre accesible y rol apropiado; añade una indicación accesible cuando la acción no resulte clara por su etiqueta.
- Conserva objetivos táctiles utilizables y contraste suficiente al modificar controles. Revisa los estados de foco, carga, error y contenido vacío cuando el componente los tenga.
- Sigue las reglas de Hooks de React y las dependencias exhaustivas. No silencies una regla para ocultar un problema: reorganiza el efecto o estabiliza las dependencias de forma correcta.
- Tipos de props y modelos deben describir el contrato real, incluidos valores opcionales y nulos. No fuerces un valor por defecto si cambia el significado de ausencia.
- No añadas comentarios que repitan el código. Documenta la intención cuando una decisión o restricción no sea evidente.

## Cambios y entrega

- Comprueba el estado de Git antes de editar. Trata los cambios preexistentes como trabajo del usuario; no los descartes ni sobrescribas.
- No uses `reset`, checkout destructivo ni limpiezas amplias para resolver un diff inesperado. Inspecciona el alcance y conserva el trabajo existente.
- Si trabajas en un Git worktree distinto del repositorio principal, crea en la raíz del principal `_START_worktree_<nombre-corto>.bat` para ejecutar el `_START.bat` del worktree, y añade `_START_worktree_*.bat` al exclude local de Git. En ese caso no cambies otros archivos del repositorio principal.
- Ejecuta las comprobaciones pertinentes al cambio, no una lista fija. Informa de los comandos ejecutados y sus resultados sin afirmar verificaciones que no se hicieron.
- En cambios visibles de interfaz, reproduce el caso afectado y aporta una captura real cuando el entorno permita abrir la aplicación.
- Al entregar, resume el cambio, enlaza los archivos afectados, explica cómo se verificó y señala cualquier limitación pendiente.
