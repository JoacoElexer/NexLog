"use strict";

const express = require('express');
const authRouter = require('./authRoutes');
const centroDistribucionRouter = require('./centroDistribucionRoutes');
const entregaRouter = require('./entregaRoutes');
const rutaRouter = require('./rutaRoutes');
const zonaRepartoRouter = require('./zonaRepartoRoutes');
const categoriaRouter = require('./categoriaRoutes');
const ubicacionRouter = require('./ubicacionRoutes');
const repartidorRouter = require('./repartidorRoutes');
const vehiculoRouter = require('./vehiculoRoutes');
const usuarioRouter = require('./usuarioRoutes');
const { authenticate, requireRole } = require('../middlewares/auth_middleware');

const apiRouter = express.Router();

apiRouter.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/centros-distribucion', authenticate, centroDistribucionRouter);
apiRouter.use('/entregas', authenticate, entregaRouter);
apiRouter.use('/rutas', authenticate, rutaRouter);
apiRouter.use('/zonas-reparto', authenticate, zonaRepartoRouter);
apiRouter.use('/categorias', authenticate, categoriaRouter);
apiRouter.use('/ubicaciones', authenticate, ubicacionRouter);
apiRouter.use('/repartidores', authenticate, repartidorRouter);
apiRouter.use('/vehiculos', authenticate, vehiculoRouter);
apiRouter.use('/usuarios', authenticate, requireRole('administrador'), usuarioRouter);

function routerApi(app) {
  app.use('/api', apiRouter);
}

module.exports = routerApi;
