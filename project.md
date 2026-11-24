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

### Bloqueos

- Ninguno registrado todavía.
