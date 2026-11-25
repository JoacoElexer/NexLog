"use strict";

const express = require('express');
const RepartidorService = require('../services/repartidorService');
const { validateRequest, validateObjectIdParam } = require('../middlewares/validateRequest');
const { validateRepartidor, validateRepartidorPatch } = require('../middlewares/Repartidor_validator');

const repartidorRouter = express.Router();
const repartidorService = new RepartidorService();

repartidorRouter.get('/', async (req, res, next) => {
  try {
    const repartidores = await repartidorService.getAll();
    res.status(200).json(repartidores);
  } catch (error) {
    console.log("=========================================================");
    console.error('Error al obtener repartidores:', error);
    console.log("=========================================================");
    next(error);
  }
});

repartidorRouter.get('/:id', validateObjectIdParam(), async (req, res, next) => {
  try {
    const repartidor = await repartidorService.getById(req.params.id);
    res.status(200).json(repartidor);
  } catch (error) {
    console.log("=========================================================");
    console.error(`Error al obtener repartidor con ID ${req.params.id}:`, error);
    console.log("=========================================================");
    next(error);
  }
});

repartidorRouter.post('/', validateRequest(validateRepartidor), async (req, res, next) => {
  try {
    const repartidor = await repartidorService.create(req.body);
    res.status(201).json(repartidor);
  } catch (error) {
    console.log("=========================================================");
    console.error('Error al crear repartidor:', error);
    console.log("=========================================================");
    next(error);
  }
});

repartidorRouter.patch('/:id', validateObjectIdParam(), validateRequest(validateRepartidorPatch), async (req, res, next) => {
  try {
    const repartidor = await repartidorService.patch(req.params.id, req.body);
    res.status(200).json(repartidor);
  } catch (error) {
    console.log("=========================================================");
    console.error(`Error al actualizar repartidor con ID ${req.params.id}:`, error);
    console.log("=========================================================");
    next(error);
  }
});

repartidorRouter.delete('/:id', validateObjectIdParam(), async (req, res, next) => {
  try {
    await repartidorService.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.log("=========================================================");
    console.error(`Error al eliminar repartidor con ID ${req.params.id}:`, error);
    console.log("=========================================================");
    next(error);
  }
});

module.exports = repartidorRouter;
