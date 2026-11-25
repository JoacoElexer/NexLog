# PROJECT.md — Estado y seguimiento del proyecto

> Este archivo es el registro operativo del desarrollo. Mantenerlo actualizado
> conforme avance el trabajo. No copiar aquí toda la definición del producto:
> para el contexto estable consultar `context.md`, para la interfaz `design.md`
> y para las reglas de agentes `AGENTS.md`.

## Qué debe documentarse aquí

Actualizar este archivo durante el desarrollo con:

1. **Estado general:** etapa actual del proyecto y resumen breve del progreso real.
2. **Funcionalidades:** qué está terminado, en curso, pendiente o bloqueado.
3. **Tareas siguientes:** prioridades concretas y orden recomendado.
4. **Decisiones recientes:** decisiones de implementación aún relevantes que no deban perderse entre sesiones.
5. **Estructura del repositorio:** organización real de carpetas y archivos importantes, cuando ya exista.
6. **API y datos:** endpoints, modelos, relaciones y contratos implementados, cuando estén definidos.
7. **Pruebas:** comandos ejecutados, resultados y problemas detectados.
8. **Despliegue:** plataformas, URLs, variables requeridas (nunca valores secretos) y estado del despliegue.
9. **Bloqueos y riesgos:** problemas pendientes, dependencias y aspectos que puedan afectar la entrega.

## Reglas de actualización

- Registrar únicamente el estado real; distinguir claramente lo implementado de lo planeado.
- Actualizarlo después de cada tarea significativa o cambio que altere el progreso.
- Marcar las tareas como `Pendiente`, `En curso`, `Terminado` o `Bloqueado`.
- Añadir fecha cuando se registre un avance importante.
- No almacenar contraseñas, tokens, cadenas de conexión ni otros secretos.
- Si una decisión cambia, reflejarla aquí y actualizar también `context.md` o `design.md` cuando corresponda.

---

## Estado inicial

**Estado:** planificación funcional y de interfaz definida; implementación pendiente de registrar.

### Funcionalidades

- [ ] Configuración inicial del frontend y backend.
- [X] Conexión con MongoDB Atlas y modelos.
- [ ] Autenticación, registro pendiente y autorización por roles.
- [ ] Panel operativo unificado con mapa y explorador lateral.
- [ ] CRUD de centros, entregas, rutas, repartidores y vehículos.
- [ ] Administración geográfica de zonas Polygon.
- [ ] Búsqueda, filtros y sincronización de listas/tabla.
- [ ] Asignación geográfica de centros y zonas.
- [ ] Seguimiento simulado de repartidores.
- [ ] Vista de aprobación de usuarios.
- [ ] Vista de configuración.
- [ ] Despliegue y pruebas finales.
- [X] README inicial con propósito, funcionamiento previsto, estado actual y ejecución del backend.
- [X] Rúbrica del proyecto revisada y resumida en `rubrica.md`.
- [ ] Usuario de prueba y reporte PDF.

### Decisiones pendientes

- Framework frontend: React, Angular o Vue.
- Librería de mapas: Leaflet o Mapbox.
- Estrategia de estilos/componentes.
- Matriz detallada de permisos del operador.
- Parámetros funcionales que estarán disponibles en configuración.
- Estructura concreta de modelos, relaciones y endpoints.

### Autenticación JWT y seed de administradores (2026-11-25)

- **Decisión confirmada:** autenticación de API mediante JWT (`jsonwebtoken`) enviado en `Authorization: Bearer <token>`, usando `JWT_SECRET` y `JWT_EXPIRES_IN` desde `.env`.
- `src/middlewares/Usuario_validator.js` agrega `validateLogin`; `src/middlewares/auth_middleware.js` implementa `authenticate` (verifica token y comprueba en MongoDB que el usuario siga `aprobado`) y `requireRole(...roles)`.
- `src/services/authService.js` y `src/routes/authRoutes.js` exponen `POST /api/auth/register` (crea cuenta `operador` en estado `pendiente` sin emitir sesión), `POST /api/auth/login` (valida contraseña con `bcrypt` y bloquea cuentas `pendiente` o `rechazado` con `403`) y `GET /api/auth/me` (protegido con `authenticate`).
- `src/routes/index.js` protege `/centros-distribucion`, `/entregas`, `/rutas`, `/zonas-reparto`, `/repartidores` y `/vehiculos` con `authenticate`, y monta `/usuarios` con `authenticate` y `requireRole('administrador')`.
- `src/data/seedAdmins.js` (invocado de forma opcional al iniciar `src/index.js` y ejecutable manualmente con `npm run seed:admins`) inicializa de forma idempotente a los administradores `JoacoVRZ` y `AndresSIG` con rol `administrador` y estado `aprobado`, leyendo correos y contraseñas desde `.env` (documentado en `.env.example` sin secretos).
- Verificación ejecutada: `node --check` aprobó todos los `.js` de `src/`, `require('./src/app')` cargó sin errores y las pruebas unitarias (con `Usuario` simulado en memoria) verificaron `validateLogin`, `seedAdmins`, `AuthService.login`, `authenticate` y `requireRole` (`ALL_AUTH_AND_SEED_CHECKS_PASSED`).
- Pendientes conocidos: configurar `JWT_SECRET`, `SEED_ADMIN_JOACO_PASSWORD` y `SEED_ADMIN_ANDRES_PASSWORD` en `.env` local, ejecutar `npm run seed` contra MongoDB Atlas y probar el flujo completo de API en vivo.

### Seeds de datos demo en `src/data/` (2026-11-25)

- Se crearon los módulos idempotentes `src/data/seedCentrosDistribucion.js` (15 centros), `src/data/seedZonasReparto.js` (15 polígonos cerrados), `src/data/seedRepartidores.js` (15 repartidores), `src/data/seedVehiculos.js` (15 vehículos), `src/data/seedEntregas.js` (18 entregas con categorías variadas, incluyendo 3 pendientes fuera de cobertura) y `src/data/seedRutas.js` (15 rutas `LineString` sincronizadas con sus paradas en `Entrega.ruta`).
- Se agregó el orquestador `src/data/seedAll.js` y el script `npm run seed` en `package.json`, usando únicamente datos y coordenadas sintéticas de prueba.
- Verificación ejecutada: `node --check` aprobó todos los `.js` de `src/`, los 93 registros generados aprobaron sus validadores de `src/middlewares/` y los esquemas de Mongoose, y `seedAll({ includeAdmins: false })` ejecutado dos veces sobre almacenes en memoria comprobó idempotencia (`ALL_SEED_DATA_CHECKS_PASSED`). Queda pendiente ejecutar `npm run seed` contra MongoDB Atlas.

### Pruebas automatizadas (`tests/`, 2026-11-25)

- Se implementó una suite automatizada con `node:test` y `node:assert/strict` (sin dependencias externas) en `tests/`:
  - `tests/helpers/testServer.js`: despachador en memoria sobre `app(req, res)` (`startTestServer`) para ejecutar la cadena completa de middlewares y rutas sin requerir puertos TCP locales, además de `startLiveTestServer` para pruebas HTTP reales.
  - `tests/auth.test.js`: cubre `POST /api/auth/register`, `POST /api/auth/login` (credenciales inválidas, cuenta `pendiente`, cuenta `rechazado`, normalización de correo y emisión de JWT), `GET /api/auth/me`, aprobación por administrador vía `PATCH /api/usuarios/:id`, bloqueo por rol en `/api/usuarios` y login de `JoacoVRZ` y `AndresSIG` tras `seedAdmins`.
  - `tests/validators.test.js`: valida creación, `PATCH`, GeoJSON y los 93 registros de `src/data/`.
  - `tests/routes.crud.test.js`: cubre `/`, `/api/health`, 404 centralizado, códigos `400/404`, CRUD completo y `/geojson` con JWT válido.
  - `tests/live.login.test.js` (`npm run test:live`): prueba opcional contra MongoDB Atlas y servidor HTTP real para verificar login de los administradores configurados en `.env`.
- Scripts agregados en `package.json`: `npm test` y `npm run test:live`.
- Verificación ejecutada: `npm test` aprobó 12/12 pruebas en 3 suites (`pass 12, fail 0`) con modelos Mongoose simulados en memoria; `npm run test:live` queda pendiente de ejecutar en un entorno con red hacia MongoDB Atlas y puertos locales permitidos.

### API y datos — modelos Mongoose

**En curso (2026-11-24):** están creados los modelos Mongoose de Centro de distribución, Zona de reparto, Entrega, Ruta, Repartidor, Vehículo y Usuario, así como validadores de entidad y GeoJSON bajo `src/middlewares/`. Las dependencias del backend están instaladas en `package.json` y fijadas en `package-lock.json`. El conector vigente es `src/config/database.js` y usa `MONGO_URI`. `src/app.js` configura Express/CORS, middleware de errores y la ruta de salud; `src/index.js` conecta a MongoDB antes de abrir el servidor y cierra la conexión al apagar. Aún faltan servicios y CRUD; no se ha probado la conexión a MongoDB.

Los modelos están en `src/models/`; las validaciones de peticiones y geometrías están en `src/middlewares/`. Los esquemas marcan los campos obligatorios con `required: true`. `Entrega` incluye `categoria` como texto. Los servicios de consulta usan `populate` donde hay relaciones: rutas resuelven centro, repartidor, vehículo y entregas de sus paradas; entregas resuelven centro, zona y ruta; zonas resuelven su centro. La validación existente ya está conectada a las rutas de todas las entidades en `src/routes/`.

### Estandarización de servicios, validadores y rutas CRUD (2026-11-25)

- Se estandarizaron `entregaService.js`, `repartidorService.js`, `rutaService.js`, `vehiculoService.js`, `zonaRepartoService.js` y `usuarioService.js` como clases con la interfaz `getAll`, `getById`, `create`, `patch` (`runValidators: true`) y `delete`, además de `getGeoJson` en las entidades geográficas (`Entrega`, `Ruta` y `ZonaReparto`).
- En `usuarioService.js` se integró `bcrypt` para cifrar `password` en `passwordHash`, evitar el retorno de `passwordHash`, validar correos duplicados (`400`) y fijar `rol: 'operador'` y `estado: 'pendiente'` en el alta pública, dejando la validación de formato y campos prohibidos en `Usuario_validator.js`.
- Se agregaron `isPlainObject` y `checkPatchBody` en `src/middlewares/common_validator.js`, y se implementaron los validadores de actualización parcial (`validateEntregaPatch`, `validateRepartidorPatch`, `validateRutaPatch`, `validateVehiculoPatch`, `validateZonaRepartoPatch` y `validateUsuarioPatch`) en `src/middlewares/`.
- Se completaron `entregaRoutes.js`, `repartidorRoutes.js`, `rutaRoutes.js`, `usuarioRoutes.js`, `vehiculoRoutes.js` y `zonaRepartoRoutes.js` replicando la plantilla de `centroDistribucionRoutes.js`, conectando `validateRequest(...)` tanto en `POST /` como en `PATCH /:id` con el validador correspondiente de `src/middlewares/`.
- `src/routes/index.js` ya monta `/api/auth` y `/api/usuarios` (protegido para `administrador`), además de las rutas operativas autenticadas.
- Pendientes conocidos: confirmar el catálogo definitivo de estados de usuario (`pendiente`, `aprobado`, `rechazado`) y ejecutar pruebas HTTP contra MongoDB Atlas.
- Verificación ejecutada: `node --check` aprobó todos los `.js` de `src/`, `require('./src/app')` cargó sin errores, se probaron casos válidos e inválidos de todos los validadores de creación y `PATCH`, y se comprobó que cada router adjunta los middlewares esperados en `POST /` y `PATCH /:id`.

### CRUD de centros de distribución (2026-11-24)

- `src/services/centroDistribucionService.js` implementa listar, consultar por ID, consultar datos geográficos, crear, actualizar y eliminar centros.
- Se corrigieron el orden de los argumentos de `AppError`, el nombre de campo de ubicación en la consulta geográfica y la actualización para ejecutar validadores de Mongoose.
- Se corrigieron las importaciones internas de los validadores para que usen los nombres de archivo vigentes `common_validator.js` y `geoJson_validator.js`.
- `src/routes/centroDistribucionRoutes.js` conecta los validadores de cuerpo y de `ObjectId` antes de llamar al servicio. Endpoints disponibles bajo `/api/centros-distribucion`: `GET /`, `GET /geojson`, `GET /:id`, `POST /`, `PATCH /:id` y `DELETE /:id`.
- Verificación: los validadores de creación y actualización parcial rechazan cuerpos inválidos; la aplicación y las rutas de centros cargan correctamente. La prueba HTTP local no se pudo completar porque el entorno denegó la conexión al puerto local (`EACCES`).

### Arranque y revisión técnica (2026-11-24)

- Corregidos los exports de los modelos para registrar nombre, esquema y colección Mongoose.
- `src/index.js` importa `connectDatabase` y `disconnectDatabase` desde el objeto exportado por `src/config/database.js`. El proceso inicia después de conectar a MongoDB y gestiona `SIGINT`/`SIGTERM` para cerrar servidor y conexión.
- Corregido el error `connectDatabase is not a function`: `index.js` trataba el objeto exportado por `database.js` como si fuera directamente la función. El apagado usa ahora `disconnectDatabase` del mismo módulo.
- `src/app.js` registra la ruta raíz y evita incluir query strings en el log de peticiones.
- El endpoint de salud está en `GET /api/health`.
- Dependencias instaladas: `express`, `cors`, `dotenv`, `mongoose` y `bcrypt`; `nodemon` está instalado como dependencia de desarrollo. Scripts disponibles: `npm start` y `npm run dev`.
- npm reportó dos vulnerabilidades moderadas después de agregar nodemon; pendientes de revisar. No se ejecutó una actualización automática de dependencias.
- Verificación actual: `node --check` pasó en los 24 archivos JavaScript. Se confirmó que `Entrega.categoria` y los campos esenciales usan `required: true`, y que el servicio de rutas configura `populate` para sus cuatro relaciones. El validador de centro sigue pasando casos válidos e inválidos. No se ha ejecutado una consulta contra MongoDB.
- Pendiente: probar inicio del servidor y conexión con `MONGO_URI` configurada, e implementar servicios y CRUD.

Relaciones y decisiones iniciales que siguen sujetas a revisión:

- Las zonas pertenecen a un centro y guardan un GeoJSON Polygon.
- Las entregas guardan su destinatario, dirección y punto de destino; las referencias al centro, zona y ruta son opcionales para permitir resolver destinos sin cobertura.
- Las rutas pertenecen a un centro, guardan paradas ordenadas referidas a entregas y pueden asociar un repartidor y un vehículo.
- Los repartidores no tienen cuenta de usuario, de acuerdo con el alcance actual.
- El usuario almacena `passwordHash` (el servicio deberá generar el hash con bcrypt), correo normalizado único, rol y estado de aprobación. El rol público por defecto es operador; la asignación de administrador debe restringirse al mecanismo administrativo/seed autorizado.
- Los vehículos usan `placa` como identificador único.
- No se creó modelo de configuración: los parámetros funcionales disponibles aún no están definidos.

```js
// CentroDistribucion
{
  nombre: String, // obligatorio
  gerente: String, // nombre del gerente del centro
  direccion: {
    calle: String,
    ciudad: String,
    estado: String
  },
  ubicacion: {
    type: "Point",
    coordinates: [Number, Number] // [longitud, latitud]
  },
  coberturaKm: Number, // positivo
  estado: "operativo" | "inactivo",
  createdAt: Date,
  updatedAt: Date
}
```

- El atributo `codigo` se excluye de esta propuesta.
- Los puntos, polígonos y recorridos usan GeoJSON, validan coordenadas `[longitud, latitud]` y sus rangos; sus campos geográficos tienen índices `2dsphere`.
- La cobertura es un radio en kilómetros, independiente de los polígonos de zona.
- Solo los centros operativos serían candidatos para asignación geográfica; si ninguno cubre un destino, se requiere resolución administrativa.
- Los flujos que mantienen referencias sincronizadas (por ejemplo, asignar entregas a rutas y recursos) quedan a cargo de los servicios, aún pendientes.

### Endpoints de la API implementados (2026-11-25)

| Entidad / Módulo | Método y ruta | Acceso y middlewares | Función de servicio | Descripción |
|---|---|---|---|---|
| Sistema | `GET /` | Pública | Respuesta directa en `app.js` | Devuelve nombre, versión y endpoint base de salud (`200`). |
| Sistema | `GET /api/health` | Pública | Respuesta directa en `routes/index.js` | Verifica que el servicio Express esté activo (`200`). |
| Autenticación | `POST /api/auth/register` | Pública; `validateRequest(validateRegistroUsuario)` | `AuthService.register` → `UsuarioService.create` | Registra un usuario nuevo con contraseña cifrada en `bcrypt`, rol `operador` y estado `pendiente`, sin emitir sesión (`201`). |
| Autenticación | `POST /api/auth/login` | Pública; `validateRequest(validateLogin)` | `AuthService.login` | Valida credenciales con `bcrypt`, exige estado `aprobado` y devuelve token JWT y datos básicos sin `passwordHash` (`200`). |
| Autenticación | `GET /api/auth/me` | `authenticate` | `AuthService.getProfile` → `UsuarioService.getById` | Obtiene el perfil del usuario autenticado mediante su JWT (`200`). |
| Centros de distribución | `GET /api/centros-distribucion` | `authenticate` | `CentroDistribucionService.getAll` | Lista todos los centros ordenados alfabéticamente por `nombre` (`200`). |
| Centros de distribución | `GET /api/centros-distribucion/geojson` | `authenticate` | `CentroDistribucionService.getGeoJson` | Devuelve centros con `nombre`, `gerente`, `ubicacion` (`Point`), `coberturaKm` y `estado` (`200`). |
| Centros de distribución | `GET /api/centros-distribucion/:id` | `authenticate`; `validateObjectIdParam` | `CentroDistribucionService.getById` | Consulta un centro de distribución por su `ObjectId` (`200` / `404`). |
| Centros de distribución | `POST /api/centros-distribucion` | `authenticate`; `validateRequest(validateCentroDistribucion)` | `CentroDistribucionService.create` | Crea un nuevo centro de distribución (`201`). |
| Centros de distribución | `PATCH /api/centros-distribucion/:id` | `authenticate`; `validateObjectIdParam`; `validateRequest(validateCentroDistribucionPatch)` | `CentroDistribucionService.patch` | Actualiza parcialmente un centro con validadores Mongoose activos (`200` / `404`). |
| Centros de distribución | `DELETE /api/centros-distribucion/:id` | `authenticate`; `validateObjectIdParam` | `CentroDistribucionService.delete` | Elimina un centro de distribución por ID (`204` / `404`). |
| Zonas de reparto | `GET /api/zonas-reparto` | `authenticate` | `ZonaRepartoService.getAll` | Lista todas las zonas ordenadas por creación descendente con `populate` de `centro` (`200`). |
| Zonas de reparto | `GET /api/zonas-reparto/geojson` | `authenticate` | `ZonaRepartoService.getGeoJson` | Devuelve zonas con `nombre`, `descripcion`, `centro`, `geometria` (`Polygon`) y `estado` (`200`). |
| Zonas de reparto | `GET /api/zonas-reparto/:id` | `authenticate`; `validateObjectIdParam` | `ZonaRepartoService.getById` | Consulta una zona de reparto por ID con `populate` de `centro` (`200` / `404`). |
| Zonas de reparto | `POST /api/zonas-reparto` | `authenticate`; `validateRequest(validateZonaReparto)` | `ZonaRepartoService.create` | Crea una nueva zona poligonal de reparto (`201`). |
| Zonas de reparto | `PATCH /api/zonas-reparto/:id` | `authenticate`; `validateObjectIdParam`; `validateRequest(validateZonaRepartoPatch)` | `ZonaRepartoService.patch` | Actualiza parcialmente una zona y la devuelve populada (`200` / `404`). |
| Zonas de reparto | `DELETE /api/zonas-reparto/:id` | `authenticate`; `validateObjectIdParam` | `ZonaRepartoService.delete` | Elimina una zona de reparto por ID (`204` / `404`). |
| Entregas | `GET /api/entregas` | `authenticate` | `EntregaService.getAll` | Lista las entregas ordenadas por creación descendente con `populate` de `centro`, `zona` y `ruta` (`200`). |
| Entregas | `GET /api/entregas/geojson` | `authenticate` | `EntregaService.getGeoJson` | Devuelve entregas con `destinatario`, `categoria`, `direccionDestino`, `destino` (`Point`), `estado` y referencias (`200`). |
| Entregas | `GET /api/entregas/:id` | `authenticate`; `validateObjectIdParam` | `EntregaService.getById` | Consulta una entrega por ID con `populate` de `centro`, `zona` y `ruta` (`200` / `404`). |
| Entregas | `POST /api/entregas` | `authenticate`; `validateRequest(validateEntrega)` | `EntregaService.create` | Registra una entrega con su punto GeoJSON de destino (`201`). |
| Entregas | `PATCH /api/entregas/:id` | `authenticate`; `validateObjectIdParam`; `validateRequest(validateEntregaPatch)` | `EntregaService.patch` | Actualiza parcialmente una entrega y la devuelve populada (`200` / `404`). |
| Entregas | `DELETE /api/entregas/:id` | `authenticate`; `validateObjectIdParam` | `EntregaService.delete` | Elimina una entrega por ID (`204` / `404`). |
| Rutas | `GET /api/rutas` | `authenticate` | `RutaService.getAll` | Lista todas las rutas con `populate` de `centro`, `repartidor`, `vehiculo` y `paradas.entrega` (`200`). |
| Rutas | `GET /api/rutas/geojson` | `authenticate` | `RutaService.getGeoJson` | Devuelve rutas con `nombre`, referencias, `paradas`, `geometria` (`LineString`) y `estado` (`200`). |
| Rutas | `GET /api/rutas/:id` | `authenticate`; `validateObjectIdParam` | `RutaService.getById` | Consulta una ruta por ID con sus cuatro relaciones populadas (`200` / `404`). |
| Rutas | `POST /api/rutas` | `authenticate`; `validateRequest(validateRuta)` | `RutaService.create` | Crea una ruta con paradas ordenadas y geometría `LineString` (`201`). |
| Rutas | `PATCH /api/rutas/:id` | `authenticate`; `validateObjectIdParam`; `validateRequest(validateRutaPatch)` | `RutaService.patch` | Actualiza parcialmente una ruta y la devuelve populada (`200` / `404`). |
| Rutas | `DELETE /api/rutas/:id` | `authenticate`; `validateObjectIdParam` | `RutaService.delete` | Elimina una ruta por ID (`204` / `404`). |
| Repartidores | `GET /api/repartidores` | `authenticate` | `RepartidorService.getAll` | Lista todos los repartidores ordenados por `nombre` (`200`). |
| Repartidores | `GET /api/repartidores/:id` | `authenticate`; `validateObjectIdParam` | `RepartidorService.getById` | Consulta un repartidor por ID (`200` / `404`). |
| Repartidores | `POST /api/repartidores` | `authenticate`; `validateRequest(validateRepartidor)` | `RepartidorService.create` | Crea un repartidor (`201`). |
| Repartidores | `PATCH /api/repartidores/:id` | `authenticate`; `validateObjectIdParam`; `validateRequest(validateRepartidorPatch)` | `RepartidorService.patch` | Actualiza parcialmente un repartidor (`200` / `404`). |
| Repartidores | `DELETE /api/repartidores/:id` | `authenticate`; `validateObjectIdParam` | `RepartidorService.delete` | Elimina un repartidor por ID (`204` / `404`). |
| Vehículos | `GET /api/vehiculos` | `authenticate` | `VehiculoService.getAll` | Lista todos los vehículos ordenados por `placa` (`200`). |
| Vehículos | `GET /api/vehiculos/:id` | `authenticate`; `validateObjectIdParam` | `VehiculoService.getById` | Consulta un vehículo por ID (`200` / `404`). |
| Vehículos | `POST /api/vehiculos` | `authenticate`; `validateRequest(validateVehiculo)` | `VehiculoService.create` | Crea un vehículo con placa única (`201`). |
| Vehículos | `PATCH /api/vehiculos/:id` | `authenticate`; `validateObjectIdParam`; `validateRequest(validateVehiculoPatch)` | `VehiculoService.patch` | Actualiza parcialmente un vehículo (`200` / `404`). |
| Vehículos | `DELETE /api/vehiculos/:id` | `authenticate`; `validateObjectIdParam` | `VehiculoService.delete` | Elimina un vehículo por ID (`204` / `404`). |
| Usuarios | `GET /api/usuarios` | `authenticate`; `requireRole('administrador')` | `UsuarioService.getAll` | Lista usuarios y solicitudes ordenados por `nombre` sin exponer `passwordHash` (`200`). |
| Usuarios | `GET /api/usuarios/:id` | `authenticate`; `requireRole('administrador')`; `validateObjectIdParam` | `UsuarioService.getById` | Consulta un usuario por ID (`200` / `404`). |
| Usuarios | `POST /api/usuarios` | `authenticate`; `requireRole('administrador')`; `validateRequest(validateRegistroUsuario)` | `UsuarioService.create` | Registra un usuario desde administración validando correo único y cifrando la contraseña (`201`). |
| Usuarios | `PATCH /api/usuarios/:id` | `authenticate`; `requireRole('administrador')`; `validateObjectIdParam`; `validateRequest(validateUsuarioPatch)` | `UsuarioService.patch` | Actualiza datos, contraseña (re-cifrada), `rol` o `estado` (`pendiente`/`aprobado`/`rechazado`) de un usuario (`200` / `404`). |
| Usuarios | `DELETE /api/usuarios/:id` | `authenticate`; `requireRole('administrador')`; `validateObjectIdParam` | `UsuarioService.delete` | Elimina un usuario por ID (`204` / `404`). |

### Bloqueos

- Ninguno registrado todavía.

### Rúbrica del proyecto (2026-11-24)

- Se revisaron visualmente las cuatro páginas de `PROYECTO FINAL.pdf` y se resumieron en `rubrica.md` los once criterios (100 puntos), requisitos técnicos, entregables y reglas de revisión.
- Riesgo de alcance pendiente: la rúbrica pide un flujo específico para ubicaciones exactas con nombre, descripción, categoría, popup y tabla; el modelo operativo actual está centrado en entregas y aún debe precisarse cómo cubrir ese flujo sin asumir una entidad adicional.
- Pendiente de asegurar en la implementación: integrar los servicios de población en endpoints y confirmarlos con datos en MongoDB; completar tres CRUD internos, despliegue y usuario de prueba.
- `Entrega.categoria` cubre el dato de categoría requerido por la rúbrica. Sigue pendiente concretar el flujo de ubicación exacta con nombre, descripción, popup y tabla.
- La categoría de `Entrega` se guarda como texto para mostrar el nombre directamente. El catálogo o valores permitidos siguen sin definirse.
