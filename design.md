# DESIGN.md — Conceptos de diseño del SGLD

> Documento vivo. Registrar aquí decisiones visuales y de interacción.
> No asumir que los ejemplos conceptuales son una implementación definitiva.

## 1. Dirección general

- Tipo de interfaz: panel operativo administrativo.
- Prioridad: funcionalidad, legibilidad y rapidez de operación.
- Estilo: limpio, sobrio y utilitario; evitar adornos, animaciones innecesarias y exceso de tarjetas.
- El mapa es el espacio de trabajo principal y debe ocupar la mayor parte del área disponible.
- No se busca construir un dashboard tradicional con múltiples páginas independientes para cada entidad.

## 2. Arquitectura de vistas y navegación

La aplicación tendrá cuatro vistas diferenciadas:

1. **Acceso y registro:** pantalla pública para iniciar sesión o solicitar una cuenta.
2. **Panel operativo:** vista autenticada unificada con mapa, explorador de entidades y filtros.
3. **Aprobación de usuarios:** vista administrativa para revisar solicitudes de registro.
4. **Configuración:** vista administrativa para modificar opciones funcionales de la aplicación. [Pendiente de aprobar]

La navegación autenticada debe permitir llegar al panel operativo y, únicamente para administradores, a las vistas de aprobación y configuración. Los operadores no deben visualizar ni poder abrir estas secciones.

La vista de aprobación y la de configuración son pantallas separadas del panel operativo; no deben convertirse en dashboards por cada entidad operativa.

## 3. Panel operativo unificado

Estructura principal:

1. Barra superior compacta para identidad del sistema, usuario activo y acciones globales.
2. Barra lateral izquierda tipo explorador de archivos de VS Code/IDE.
3. Área central de mapa interactivo.
4. Controles de filtros/capas y herramientas de mapa.
5. Popups, modales o paneles contextuales para crear y editar registros.

La barra lateral funcionará como explorador de entidades, no como navegación entre dashboards.

## 4. Barra lateral tipo explorador

Secciones iniciales:

- Centros de distribución
- Zonas de reparto
- Entregas
- Rutas
- Repartidores
- Vehículos

Cada sección podrá expandirse y mostrar sus registros en una lista jerárquica. Debe permitir:

- Expandir/contraer secciones.
- Seleccionar un elemento y centrar/resaltar su representación en el mapa.
- Agregar un registro nuevo.
- Editar un registro existente.
- Eliminar un registro con confirmación.
- Mostrar estados mediante etiquetas o iconos discretos cuando sea útil.

La lista debe seguir siendo utilizable con muchos registros; considerar búsqueda por sección y scroll.

## 5. Mapa operativo

El mapa mostrará elementos geográficos según los filtros activos:

- Centros de distribución: marcadores diferenciados.
- Entregas: marcadores según estado o categoría.
- Zonas: polígonos con relleno/transparencia y borde visible.
- Rutas: polilíneas y paradas ordenadas.
- Repartidores: marcadores móviles durante la simulación.
- Vehículos: información asociada a rutas/repartidores; no necesariamente un marcador independiente si duplica visualmente al repartidor.

Los elementos deben tener popup con información relevante y acciones disponibles según permisos.

## 6. Filtros y capas

Incluir controles para mostrar u ocultar tipos de elementos en el mapa:

- Centros
- Zonas
- Entregas
- Rutas
- Repartidores

Los filtros visuales no deben eliminar ni modificar registros. Solo controlan su representación.

Cuando existan filtros de búsqueda (nombre, estado, categoría, zona u otros), reflejar el resultado tanto en el mapa como en las listas/tabla correspondientes.

## 7. Crear y editar

- La creación de elementos puede iniciarse desde el botón `+` de cada sección.
- Cuando el registro requiere ubicación, permitir seleccionar el punto en el mapa o capturar coordenadas/dirección mediante el formulario.
- La edición debe abrir un popup/modal contextual asociado al elemento seleccionado, sin navegar a una página separada.
- Para zonas, utilizar una herramienta de dibujo de polígonos en el mapa.
- La eliminación siempre requiere confirmación.
- Mostrar mensajes claros de éxito y error.
- Después de crear, editar o eliminar, actualizar mapa y lista/tabla sin recargar la página.

## 8. Vista de aprobación de usuarios

Vista exclusiva para administradores. Debe incluir:

- Listado de solicitudes pendientes.
- Datos no sensibles necesarios para identificar y revisar cada solicitud, como nombre, correo y fecha de registro.
- Acciones explícitas para aprobar o rechazar.
- Confirmación antes de rechazar o ejecutar una acción irreversible.
- Indicadores de estado: pendiente, aprobada o rechazada.
- Posibilidad de consultar solicitudes ya procesadas si el tiempo lo permite.

Al aprobar, la cuenta podrá acceder al sistema conforme a su rol. Rechazar no debe conceder acceso. El registro público no inicia sesión automáticamente.

## 9. Vista de configuración

Vista exclusiva para administradores. Debe concentrar únicamente preferencias funcionales y seguras, por ejemplo:

- Nombre de la empresa y datos generales mostrados en la interfaz.
- Parámetros predeterminados de cobertura, si se decide que sean configurables.
- Preferencias de visualización del mapa.
- Parámetros funcionales de seguimiento simulado.

No exponer ni editar desde esta pantalla secretos, contraseñas, tokens, cadenas de conexión, configuración del servidor ni variables de entorno. Los valores técnicos sensibles se administran fuera de la aplicación.

Evitar agregar opciones sin una necesidad concreta; mantener esta vista pequeña para proteger el tiempo de desarrollo.

## 10. Seguimiento simulado

- El repartidor se representa con un marcador claramente distinguible.
- La ruta muestra el recorrido y sus paradas.
- Diferenciar paradas pendientes, completadas y la siguiente parada.
- Permitir iniciar, pausar y reiniciar la simulación si el tiempo lo permite.
- Mostrar una etiqueta visible que indique que la ubicación es simulada.
- Evitar afirmar que se está mostrando GPS real.

## 11. Diseño adaptable y estados

- Priorizar escritorio, porque el usuario principal es un administrador que trabaja con mapa y listas.
- En pantallas estrechas, la barra lateral podrá contraerse y el mapa ocupar el espacio disponible.
- Definir estados vacíos, carga, error, sin resultados y confirmación.
- Mantener contraste suficiente entre polígonos, rutas y marcadores.
- No depender exclusivamente del color para comunicar estados.

## 12. Decisiones pendientes

Registrar aquí cuando el equipo las confirme:

- Framework frontend: React / Angular / Vue.
- Librería de mapas: Leaflet / Mapbox.
- Librería de componentes o estrategia CSS.
- Paleta y tipografía.
- Comportamiento exacto de popup frente a modal/panel lateral.
- Distribución y tamaño de la barra lateral.
- Diseño de iconos por entidad.
- Comportamiento responsive.
- Matriz detallada de permisos del rol operador.
- Lista definitiva de parámetros editables en configuración.
