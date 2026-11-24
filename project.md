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
- [ ] Conexión con MongoDB Atlas y modelos.
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
- [ ] README, `.env.example`, usuario de prueba y reporte PDF.

### Decisiones pendientes

- Framework frontend: React, Angular o Vue.
- Librería de mapas: Leaflet o Mapbox.
- Estrategia de estilos/componentes.
- Mecanismo de sesión/autenticación.
- Matriz detallada de permisos del operador.
- Parámetros funcionales que estarán disponibles en configuración.
- Estructura concreta de modelos, relaciones y endpoints.

### API y datos — modelos Mongoose

**En curso (2026-11-24):** están creados los modelos Mongoose de Centro de distribución, Zona de reparto, Entrega, Ruta, Repartidor, Vehículo y Usuario, así como validadores de entidad y GeoJSON bajo `src/validators/`. Las dependencias del backend están instaladas en `package.json` y fijadas en `package-lock.json`. El conector vigente es `src/config/database.js` y usa `MONGO_URI`. `src/app.js` configura Express/CORS, middleware de errores y la ruta de salud; `src/index.js` conecta a MongoDB antes de abrir el servidor y cierra la conexión al apagar. Aún faltan servicios y CRUD; no se ha probado la conexión a MongoDB.

Los modelos están en `src/models/`; no contienen reglas de validación de entrada. Las validaciones de entidades y geometrías están en `src/validators/` y se pueden aplicar desde rutas con `src/middlewares/validateRequest.js`. Ese middleware aún no está conectado a endpoints CRUD porque esas rutas todavía no existen. Los modelos mantienen tipos, defaults, referencias e índices de base de datos.

### Arranque y revisión técnica (2026-11-24)

- Corregidos los exports de los modelos para registrar nombre, esquema y colección Mongoose.
- `src/index.js` importa `connectDatabase` y `disconnectDatabase` desde el objeto exportado por `src/config/database.js`. El proceso inicia después de conectar a MongoDB y gestiona `SIGINT`/`SIGTERM` para cerrar servidor y conexión.
- Corregido el error `connectDatabase is not a function`: `index.js` trataba el objeto exportado por `database.js` como si fuera directamente la función. El apagado usa ahora `disconnectDatabase` del mismo módulo.
- `src/app.js` registra la ruta raíz y evita incluir query strings en el log de peticiones.
- El endpoint de salud está en `GET /api/health`.
- Dependencias instaladas: `express`, `cors`, `dotenv`, `mongoose` y `bcrypt`; `nodemon` está instalado como dependencia de desarrollo. Scripts disponibles: `npm start` y `npm run dev`.
- npm reportó dos vulnerabilidades moderadas después de agregar nodemon; pendientes de revisar. No se ejecutó una actualización automática de dependencias.
- Verificación actual: `node --check` pasó en los 23 archivos JavaScript; un caso válido e inválido pasó en el validador de centro; una búsqueda confirmó que los modelos no contienen reglas de validación; y `app.js` junto con los siete modelos se cargaron correctamente.
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

### Bloqueos

- Ninguno registrado todavía.
