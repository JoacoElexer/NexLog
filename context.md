# SGLD — Contexto del proyecto

## 1. Descripción general

**Nombre provisional:** Sistema de Gestión Logística y Distribución (SGLD).

Aplicación web para administrar las operaciones de una empresa de paquetería con múltiples centros de distribución. El sistema centraliza centros, zonas de reparto, entregas, rutas, repartidores y vehículos, y permite supervisar las operaciones mediante un mapa interactivo.

La geolocalización es una parte esencial: los centros y destinos se representan como puntos, las zonas de reparto como polígonos y las rutas como recorridos geográficos.

## 2. Objetivo

Desarrollar una plataforma operativa que permita organizar la distribución de paquetes entre varios centros, asignar entregas y recursos, administrar recorridos y visualizar el avance de los repartidores mediante una simulación de movimiento en el mapa.

La problemática formal del proyecto se redactará posteriormente. No inventar ni cerrar esa redacción sin confirmación del equipo.

## 3. Alcance acordado

### Incluido

- Autenticación de usuarios.
- Registro público de usuarios sujeto a aprobación administrativa. Las cuentas nuevas quedan pendientes y no obtienen acceso hasta ser aprobadas.
- Vista administrativa para revisar, aprobar o rechazar solicitudes de registro.
- Vista de configuración de la aplicación, restringida al administrador.
- Roles de administrador y operador. La matriz de permisos detallada debe mantenerse documentada y confirmarse antes de implementar permisos no definidos.
- CRUD de centros de distribución.
- CRUD de entregas.
- Las entregas incluyen una categoría textual para identificar y filtrar su punto de destino en el mapa.
- CRUD de rutas.
- CRUD de repartidores.
- CRUD de vehículos.
- Administración de zonas de reparto mediante polígonos GeoJSON.
- Asignación de entregas al centro de distribución elegible más cercano, considerando su radio/cobertura.
- Asociación de zonas de reparto con centros.
- Asignación de repartidores y vehículos a rutas.
- Visualización de centros, zonas, entregas, rutas, repartidores y vehículos en un mapa.
- Filtros para mostrar u ocultar capas y tipos de elementos.
- Seguimiento simulado del movimiento de repartidores.
- Tabla/listado de elementos y búsqueda/filtros según las necesidades de la rúbrica.

### Fuera de alcance

- Optimización automática de rutas.
- Análisis predictivo o análisis de patrones.
- Facturación y gestión financiera.
- Gestión avanzada de inventarios.
- Seguimiento GPS real en esta entrega.
- Aplicación móvil independiente para repartidores.

La arquitectura puede evitar bloquear una futura integración GPS, pero no se debe implementar esa integración ahora.

## 4. Asignación geográfica

Distinguir dos operaciones:

1. **Asignación de centro:** al registrar una entrega, calcular la distancia entre el destino y los centros disponibles. Elegir el centro elegible más cercano cuya cobertura incluya el destino. Si ningún centro cubre el destino, informar el caso y permitir una resolución administrativa; no asignar silenciosamente un centro fuera de cobertura.
2. **Asignación de zona:** las zonas son polígonos dibujados/administrados en el mapa y asociados a un centro. La pertenencia de un destino a una zona se determina mediante una comprobación punto-en-polígono.

La distancia puede calcularse con Haversine. Mantener esta lógica sencilla; no implementar optimización territorial.

## 5. Seguimiento simulado

El administrador visualiza la posición de cada repartidor en una ruta. La simulación mueve un marcador siguiendo una secuencia ordenada de coordenadas o la geometría de la ruta.

Debe quedar claramente identificado como **simulación**, no como GPS real. La primera versión puede ejecutarse en frontend. Si el tiempo lo permite, evaluar sincronización mediante polling o Socket.IO, sin convertirlo en requisito crítico.

## 6. Actores y permisos

- **Administrador:** acceso a todas las vistas y operaciones; administra usuarios, solicitudes de registro, configuración, centros, zonas y operaciones.
- **Operador:** acceso al panel operativo y a las operaciones que se le autoricen. No puede aprobar/rechazar usuarios ni modificar la configuración administrativa.
- **Repartidor:** no tendrá una interfaz o cuenta independiente en el alcance inicial; su desplazamiento se representa mediante simulación controlada desde el sistema.

La autorización debe comprobarse en el backend. Ocultar enlaces o botones en frontend no sustituye la protección de endpoints.

## 7. Vistas acordadas

La aplicación tendrá estas vistas:

1. **Acceso y registro:** inicio de sesión y formulario de registro. El registro genera una solicitud pendiente y no inicia sesión automáticamente.
2. **Panel operativo:** vista unificada con mapa central, barra lateral tipo explorador de IDE, filtros/capas y gestión contextual de entidades.
3. **Aprobación de usuarios:** listado de solicitudes pendientes y consulta de solicitudes procesadas, con acciones para aprobar o rechazar según permisos.
4. **Configuración:** opciones funcionales generales de la aplicación, accesibles únicamente al administrador. [Pendiente de aprobar]

Esta estructura satisface el objetivo de contar con al menos tres vistas diferenciadas sin dividir la operación en dashboards independientes por entidad. No incluir secretos, credenciales ni configuración técnica sensible en la vista de configuración: esos valores permanecen en variables de entorno.

## 8. Tecnologías obligatorias del proyecto académico

- Frontend: React, Angular o Vue (usar un proyecto creado con CLI/Vite; no HTML/JS suelto).
- Mapa: Leaflet o Mapbox.
- Backend: Node.js + Express.
- Base de datos: MongoDB Atlas + Mongoose.
- Validar las peticiones y geometrías GeoJSON en `src/middlewares/`. Los modelos Mongoose definen la persistencia y las relaciones, y marcan con `required: true` los campos obligatorios.
- Geometrías: GeoJSON Point para ubicaciones y Polygon para zonas, coordenadas en orden `[longitud, latitud]` e índice `2dsphere`.
- Seguridad: contraseñas cifradas con bcrypt; autenticación de sesión mediante JWT (`jsonwebtoken` vía `Authorization: Bearer`); secretos únicamente en `.env`; incluir `.env.example`.
- Despliegue público de frontend, backend y base de datos accesible durante la revisión.

No asumir decisiones aún no confirmadas (por ejemplo, React frente a Vue, Leaflet frente a Mapbox o librerías de UI). Proponer opciones y registrar la decisión cuando se tome.

## 9. Requisitos de evaluación que deben preservarse

La rúbrica ponderada, sus reglas de entrega y sus requisitos de revisión están resumidos en `rubrica.md`; consultarlo junto con este alcance antes de implementar.

- Login y registro.
- Al menos tres CRUD completos de entidades distintas de usuarios, ubicaciones y zonas. Los CRUD acordados de entregas, rutas, repartidores y vehículos cubren este requisito; centros también tendrá CRUD.
- Registro, edición y eliminación de ubicaciones desde el mapa.
- Tabla de ubicaciones sincronizada sin recargar la página.
- Búsqueda por nombre parcial sin distinguir mayúsculas, filtro por categoría y un tercer filtro pertinente.
- Dibujo, persistencia y eliminación de zonas Polygon.
- Al menos tres vistas: la aplicación contempla acceso/registro, panel operativo, aprobación de usuarios y configuración.
- Backend organizado en `config`, `models`, `routes`, `services`, `middlewares` y `utils`.
- Códigos HTTP apropiados y manejo centralizado de errores.
- Despliegue, repositorio público, README, `.env.example`, usuario de prueba y reporte PDF.

## 10. Principios de trabajo

- Priorizar una versión completa, funcional y desplegada sobre funcionalidades adicionales.
- No ampliar el alcance sin discutir impacto en tiempo.
- Mantener coherencia entre frontend, API y modelos.
- Las decisiones de diseño visual y navegación se registran en `design.md`.
- Las instrucciones de implementación y colaboración para agentes se registran en `AGENTS.md`.
- El estado actual, tareas, avances, bloqueos y pendientes se registran en `project.md`.
- Actualizar la documentación correspondiente cuando cambie una decisión estable o una implementación afecte el alcance, la arquitectura, la interfaz o el estado del proyecto.
