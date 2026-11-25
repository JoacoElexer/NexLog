# Rúbrica del proyecto final

## Fuente y alcance

Este documento resume los requisitos de evaluación de `PROYECTO FINAL.pdf`. La rúbrica asigna 100 puntos a once criterios. Se debe cumplir también con las reglas de entrega y los requisitos técnicos obligatorios descritos al final; una aplicación incompleta o que no pueda probarse durante el periodo de revisión no entra a evaluación.

## Criterios de evaluación

| Criterio | Puntos | Requisitos principales |
|---|---:|---|
| Inicio de sesión | 10 | Vista propia de acceso; validar las credenciales contra usuarios en MongoDB comparando la contraseña con su hash; mostrar un error claro ante credenciales incorrectas y bloquear el acceso a vistas internas sin sesión. |
| Registro de usuarios | 10 | Permitir crear cuenta desde la pantalla de acceso; guardar usuario en MongoDB con contraseña cifrada; validar campos y evitar correos duplicados. |
| CRUD internos | 10 | Implementar al menos tres CRUD completos (crear, listar, editar y eliminar) de entidades propias, distintas de usuarios, ubicaciones y zonas. Incluir al menos una relación entre entidades con `ObjectId` y `populate`. |
| Registro de ubicaciones exactas | 5 | Al hacer clic en el mapa, registrar una ubicación con nombre, descripción, categoría y coordenadas; guardar en MongoDB como GeoJSON `Point [longitud, latitud]` y mostrarla en un popup. |
| Edición de ubicaciones | 5 | Permitir editar desde el popup del mapa la información de una ubicación existente y persistir los cambios en MongoDB. |
| Eliminación de ubicaciones | 5 | Permitir eliminar desde el popup una ubicación existente y borrar el registro de MongoDB. |
| Tabla de ubicaciones registradas | 10 | Mostrar las ubicaciones en una tabla sincronizada con MongoDB. Incluir sus datos salvo el ID; mostrar el nombre de categoría en vez de su ID. Actualizar la tabla sin recargar la página al crear, editar o eliminar desde el mapa. |
| Búsqueda y filtros | 10 | Buscar por nombre parcial sin distinguir mayúsculas, filtrar por categoría y añadir un tercer filtro pertinente (por ejemplo, estado, fecha o zona). Resolver el filtrado en backend mediante parámetros de consulta y reflejar resultados en mapa y tabla. |
| Trazo de zonas en mapa | 15 | Permitir dibujar zonas poligonales en el mapa, asignarles nombre y guardarlas en MongoDB como GeoJSON `Polygon` con vértices `[longitud, latitud]`. Cargar las zonas al abrir la aplicación y conservarlas hasta que se eliminen. |
| Diseño de interfaz | 10 | Incluir al menos tres vistas: inicio de sesión/registro, vista principal con mapa y tabla, y otra relacionada con el proyecto. Usar navegación clara y diseño coherente, con mensajes visibles de éxito y error. |
| Estructura del backend | 10 | Separar `routes`, `services`, `middlewares` y `models`. Las rutas reciben peticiones y llaman a servicios; estos contienen la lógica y las operaciones MongoDB. Centralizar validación y errores con `AppError`, 404 y `errorHandler`. Responder con códigos HTTP adecuados: 200, 201, 400, 401, 404 y 500. |
| **Total** | **100** | |

## Requisitos técnicos obligatorios

Si alguno de estos requisitos no se cumple, el proyecto no entra a revisión:

- **Frontend:** aplicación creada con Angular, React o Vue mediante CLI o Vite. No se acepta HTML/JavaScript suelto.
- **Mapa:** Leaflet o Mapbox. Se puede usar un complemento para dibujar zonas, como Leaflet-Geoman o Leaflet.draw, si el equipo puede explicar su uso.
- **Backend:** Node.js y Express con las capas del semestre (`config`, `models`, `routes`, `services`, `middlewares` y `utils`).
- **Base de datos:** MongoDB Atlas con Mongoose. Guardar puntos y polígonos como GeoJSON, con coordenadas `[longitud, latitud]` e índice `2dsphere`.
- **Seguridad:** cifrar contraseñas con bcrypt; no guardar contraseñas en texto plano. Mantener credenciales y cadenas de conexión en `.env`; incluir `.env.example` sin datos reales.
- **Despliegue:** frontend, backend y base de datos accesibles desde Internet durante todo el periodo de revisión. La rúbrica da ejemplos de plataformas, no las impone como únicas opciones.

## Entregables

Se suben a Teams por un solo integrante. La falta de cualquiera de estos elementos implica cero de calificación:

1. **Liga de la aplicación publicada**, mediante dominio o IP, operativa durante el periodo de revisión.
2. **Usuario de prueba** con correo y contraseña, y datos cargados para que se pueda revisar la aplicación sin registrarse.
3. **Liga del repositorio público** que contenga frontend y backend, un `README.md` con instrucciones de ejecución local y `.env.example`. El repositorio no debe incluir contraseñas ni cadenas de conexión reales.
4. **Reporte de desarrollo en PDF**, que incluya:
   - Portada institucional.
   - Problemática y cómo la resuelve la aplicación.
   - Desarrollo paso a paso, incluida la estructura del backend, modelos MongoDB y relaciones.
   - Resultados con capturas de cada requisito funcionando.
   - Una conclusión por integrante.

## Reglas de entrega y revisión

- La aplicación debe entregarse completa y funcionando para entrar a revisión; si no, no será considerada.
- Está prohibido copiar código, diseño u otros elementos de otros equipos o fuentes externas. Si se detecta plagio entre equipos, todos los involucrados reprueban el parcial automáticamente.
- Todos los integrantes pueden ser cuestionados sobre cualquier parte del proyecto. No poder explicar código se considera plagio.
- Todo el equipo debe trabajar en la aplicación y conocer el trabajo realizado. Si una sola persona hace todo, la calificación es cero para el equipo.

## Puntos a conciliar con el diseño de NexLog

- La rúbrica especifica un flujo de ubicaciones exactas con `nombre`, `descripción`, `categoría`, coordenadas, popup y tabla. El alcance actual de NexLog describe entregas y otras entidades georreferenciadas; antes de implementar, hay que precisar cómo se representará este requisito y cómo se relaciona con ellas. Este resumen no agrega por sí mismo una entidad nueva.
- Los CRUD acordados de entregas, rutas, repartidores y vehículos pueden cubrir el mínimo de tres CRUD internos si se implementan completos. También debe quedar explícita y funcional al menos una relación mediante `ObjectId` y `populate`.
- La aplicación contempla cuatro vistas en su diseño, que superan el mínimo de tres, siempre que estén implementadas y sean navegables durante la revisión.
- El seguimiento debe identificarse como simulación, de acuerdo con el alcance del proyecto; la rúbrica no exige GPS real.
