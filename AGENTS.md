# AGENTS.md — Instrucciones para agentes

## 1. Antes de trabajar

1. Leer `context.md` para comprender el objetivo y los límites del sistema.
2. Leer `design.md` antes de modificar la interfaz.
3. Leer `project.md` para conocer el estado, las tareas actuales, los avances y los bloqueos.
4. Revisar la estructura y convenciones existentes del repositorio antes de crear o reemplazar archivos.
5. No asumir que una tecnología o decisión está aprobada si no aparece documentada.

## 2. Regla obligatoria de mantenimiento de documentación

La documentación del proyecto es parte del trabajo, no una tarea opcional al final.

Después de cada cambio significativo, actualizar los archivos `.md` afectados:

- `context.md`: decisiones estables, alcance, requisitos, reglas de negocio, actores, permisos y restricciones.
- `design.md`: cambios de vistas, navegación, componentes, interacción, distribución visual y comportamiento responsive.
- `project.md`: estado real del proyecto, funcionalidades terminadas/en curso/pendientes, tareas siguientes, bloqueos, decisiones recientes y pruebas ejecutadas.
- `AGENTS.md`: únicamente cuando cambien las reglas permanentes de trabajo, arquitectura o colaboración para agentes.

Reglas:
- No esperar a que el usuario solicite la actualización.
- No modificar todos los documentos por rutina: actualizar solo los que correspondan al cambio.
- No registrar como terminado algo que solo está planeado o parcialmente implementado.
- No borrar decisiones o pendientes relevantes sin explicar su resolución.
- Mantener los documentos coherentes entre sí y con el código real.
- Si una decisión aún no está confirmada, marcarla como pendiente; no presentarla como definitiva.
- Al finalizar una tarea, informar qué archivos `.md` fueron actualizados y qué información se añadió o corrigió.

## 3. Reglas de alcance

- El producto es un sistema web de gestión logística y distribución para una empresa de paquetería con múltiples centros.
- El mapa es el espacio operativo central, no un adorno.
- Mantener el alcance acordado: centros, zonas, entregas, rutas, repartidores, vehículos y seguimiento simulado.
- La aplicación contempla vistas de acceso/registro, panel operativo, aprobación de usuarios y configuración.
- No agregar optimización automática de rutas, analítica predictiva, facturación, inventario avanzado, GPS real ni aplicación móvil.
- No crear módulos adicionales sin autorización.
- La problemática formal se redactará más adelante; no inventarla ni sustituirla.

## 4. Arquitectura y backend

- Backend con Node.js y Express.
- Mantener separación por capas: `config`, `models`, `routes`, `services`, `middlewares`, `validators` y `utils`.
- Las rutas reciben/validan la petición y delegan la lógica al servicio.
- Las reglas de validación de entradas (incluidas las geometrías GeoJSON) pertenecen a `validators/`, nunca a los modelos. Los modelos describen la persistencia y sus relaciones.
- La lógica de negocio y operaciones Mongoose pertenecen a los servicios.
- Usar Mongoose para MongoDB Atlas.
- Centralizar errores con un mecanismo consistente (`AppError`, middleware 404 y `errorHandler`, según la estructura del proyecto).
- Responder con códigos HTTP adecuados: 200, 201, 400, 401, 403, 404 y 500 cuando correspondan.
- Validar entradas en el backend; las validaciones frontend no sustituyen las del servidor.
- Evitar duplicar lógica de negocio entre controladores, rutas y servicios.

## 5. Geografía y mapas

- Usar GeoJSON Point para ubicaciones y Polygon para zonas.
- Respetar siempre el orden GeoJSON `[longitud, latitud]`; Leaflet suele recibir coordenadas en orden `[latitud, longitud]`, por lo que convertir explícitamente en los límites entre formatos.
- Crear índices `2dsphere` donde correspondan.
- Validar geometrías, rangos de coordenadas y cierre de anillos Polygon.
- No confundir radio de cobertura de un centro con polígono de zona de reparto.
- La asignación automática de centro debe seleccionar el centro operativo elegible más cercano dentro de su cobertura. Definir claramente el comportamiento cuando ninguno cubra el destino.
- La pertenencia a una zona se determina con una operación punto-en-polígono.
- La simulación de repartidores debe identificarse como simulación y nunca presentarse como GPS real.

## 6. Seguridad

- Nunca guardar contraseñas en texto plano; utilizar bcrypt.
- No incluir secretos, credenciales ni cadenas reales de conexión en el repositorio.
- Leer secretos desde variables de entorno y mantener `.env.example` sin valores reales.
- Proteger endpoints privados mediante middleware de autenticación.
- Comprobar autorización por rol en el backend, no solo ocultar controles en frontend.
- El registro público no debe conceder acceso inmediato: las cuentas nuevas quedan pendientes hasta aprobación administrativa.
- Solo un administrador autorizado puede aprobar o rechazar solicitudes.
- La vista de configuración debe estar restringida al administrador.
- Crear el primer administrador mediante un mecanismo de inicialización/seed seguro configurado por entorno; no depender de que exista otro administrador.
- No registrar contraseñas, tokens ni secretos en logs.
- Evitar exponer datos sensibles en respuestas de API.

## 7. Frontend e interfaz

- La interfaz operativa acordada es una vista unificada centrada en el mapa.
- Incorporar una barra lateral tipo explorador de archivos de IDE, con secciones/listas por entidad.
- Desde la barra lateral se podrán listar, crear, editar y eliminar elementos.
- Crear/editar debe abrir un popup, modal o panel contextual integrado con el mapa, según lo definido en `design.md`.
- Incorporar filtros para mostrar u ocultar categorías/capas del mapa.
- Mantener componentes reutilizables para formularios, tablas/listas, filtros, confirmaciones y mensajes.
- La navegación debe contemplar las cuatro vistas acordadas: acceso/registro, panel operativo, aprobación de usuarios y configuración.
- Las opciones de aprobación y configuración solo deben mostrarse a administradores, además de proteger sus endpoints en backend.
- Priorizar claridad, funcionalidad y consistencia; evitar trabajo visual ornamental que no aporte al flujo operativo.
- No diseñar dashboards independientes por entidad.

## 8. Colaboración y cambios

- Antes de editar, identificar archivos afectados y respetar el trabajo existente.
- No sobrescribir archivos completos si basta con un cambio localizado.
- No cambiar contratos de API, nombres de campos o modelos sin revisar dependencias frontend/backend y actualizar a los demás agentes.
- No inventar datos de negocio ni coordenadas reales. Usar datos de prueba claramente identificados.
- Evitar dependencias nuevas salvo que aporten valor claro y sean compatibles con el tiempo disponible.
- Si una tarea depende de una decisión no documentada, detenerse y preguntar o proponer una opción explícita; no tomar decisiones estructurales silenciosamente.
- Al terminar una tarea, informar archivos modificados, comportamiento implementado, pruebas ejecutadas y pendientes conocidos.
- Aplicar siempre la regla de mantenimiento de documentación de la sección 2.

## 9. Prioridad de implementación

1. Aplicación ejecutable y configuración.
2. Modelos y relaciones de datos.
3. Autenticación y autorización.
4. CRUD requeridos.
5. Mapa, puntos y polígonos.
6. Filtros y sincronización de listas/tabla.
7. Rutas y asignaciones.
8. Seguimiento simulado.
9. Aprobación de usuarios y configuración administrativa.
10. Despliegue y pruebas finales.

No sacrificar requisitos obligatorios de la rúbrica por funcionalidades opcionales.
