# NexLog SGLD

Sistema de Gestión Logística y Distribución para una empresa de paquetería con varios centros de distribución. El proyecto busca reunir en una sola plataforma la administración de centros, zonas de reparto, entregas, rutas, repartidores y vehículos, con un mapa como espacio principal de operación.

## Propósito

NexLog está diseñado para ayudar al personal administrativo y operativo a organizar la distribución de paquetes y consultar su estado y ubicación. El sistema contempla asignar cada entrega al centro operativo más cercano que cubra su destino, relacionar zonas de reparto con centros y asociar entregas, repartidores y vehículos con rutas.

La solución también contempla una simulación de movimiento de repartidores sobre el mapa. Esa ubicación será simulada y no representa seguimiento GPS real.

## Funcionamiento previsto

El flujo operativo planteado es:

1. Un operador registra una entrega con los datos del destinatario, la dirección y un punto GeoJSON de destino.
2. El sistema determina qué centro operativo cubre el destino y selecciona el más cercano. Si ninguno lo cubre, el caso requiere resolución administrativa.
3. Las zonas se dibujan como polígonos GeoJSON y se asocian con un centro. La pertenencia de un destino a una zona se determina comprobando si el punto está dentro del polígono.
4. Las entregas se organizan como paradas ordenadas en una ruta. La ruta puede asociar un repartidor y un vehículo.
5. El panel operativo previsto reúne estas entidades en un mapa con listas y filtros. La aprobación de cuentas y la configuración se reservan para administradores.

Las coordenadas GeoJSON se almacenan en orden `[longitud, latitud]`. Las ubicaciones puntuales usan `Point`, las zonas usan `Polygon` y las rutas pueden representar su recorrido mediante `LineString`.

## Estado del proyecto

El backend en Express cuenta con conexión configurada para MongoDB mediante Mongoose, modelos de datos, validadores de entrada y GeoJSON, servicios y rutas CRUD para las entidades operativas, autenticación con JWT (`bcrypt` + `jsonwebtoken`), control de acceso por rol e inicialización de administradores mediante variables de entorno. La asignación geográfica avanzada, la interfaz web, el mapa interactivo y la simulación de seguimiento están pendientes de implementación.

Capacidades principales disponibles en la API:

- `GET /` y `GET /api/health`: información general y estado del servicio.
- `/api/auth`: registro público pendiente de aprobación, inicio de sesión con JWT y consulta del perfil autenticado.
- `/api/centros-distribucion`, `/api/zonas-reparto`, `/api/entregas`, `/api/rutas`, `/api/repartidores` y `/api/vehiculos`: operaciones CRUD y consultas GeoJSON protegidas por autenticación.
- `/api/usuarios`: administración y aprobación de cuentas restringida al rol `administrador`.

La conexión a MongoDB se establece antes de que el servidor comience a escuchar. Para arrancar, se requiere una `MONGO_URI` válida y configurar `JWT_SECRET` en `.env`.

## Tecnologías

- Node.js 20.19 o posterior.
- Express 5.
- MongoDB Atlas y Mongoose 9.
- CORS y dotenv para configuración del servidor.
- bcrypt y jsonwebtoken para cifrado de contraseñas y autenticación con JWT.
- nodemon para desarrollo.

## Requisitos previos

- Node.js 20.19 o posterior y npm.
- Una instancia de MongoDB accesible y una URI de conexión.

## Instalación y ejecución

Instala las dependencias:

```bash
npm install
```

Crea un archivo `.env` a partir de `.env.example` y configura al menos `MONGO_URI` con la URI de conexión de MongoDB. No publiques `.env` ni incluyas credenciales reales en el repositorio.

Inicia el servidor en modo de desarrollo:

```bash
npm run dev
```

Para iniciar sin nodemon:

```bash
npm start
```

Por defecto, el servidor utiliza el puerto `3000`. Puede configurarse mediante `PORT`. `FRONTEND_ORIGINS` acepta una lista de orígenes separados por comas para habilitar las solicitudes del frontend mediante CORS. `MONGO_DNS_SERVERS` permite especificar servidores DNS separados por comas cuando el entorno lo requiera.

## Estructura del backend

```text
src/
├── config/         Configuración, conexión a MongoDB y seed de administradores
├── middlewares/    Errores, autenticación/roles y validación de peticiones y GeoJSON
├── models/         Esquemas Mongoose y relaciones
├── routes/         Rutas HTTP de autenticación y entidades
├── services/       Lógica de negocio y operaciones Mongoose
└── utils/          Utilidades compartidas
```

Los modelos representan `CentroDistribucion`, `ZonaReparto`, `Entrega`, `Ruta`, `Repartidor`, `Vehiculo` y `Usuario`. Las reglas de entrada y autorización se aplican en `middlewares/` antes de delegar las operaciones a `services/`.

## Alcance

El alcance previsto incluye gestión de centros, zonas, entregas, rutas, repartidores y vehículos; autenticación con aprobación administrativa; un panel operativo centrado en mapa; filtros y seguimiento simulado.

No forman parte de esta entrega la optimización automática de rutas, el análisis predictivo, la facturación, la gestión avanzada de inventarios, el GPS real ni una aplicación móvil independiente.
