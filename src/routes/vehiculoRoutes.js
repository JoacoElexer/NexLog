"use strict";

const express = require('express');
const VehiculoService = require('../services/vehiculoService');
const { validateRequest, validateObjectIdParam } = require('../middlewares/validateRequest');
const { validateVehiculo, validateVehiculoPatch } = require('../middlewares/Vehiculo_validator');

const vehiculoRouter = express.Router();
const vehiculoService = new VehiculoService();

vehiculoRouter.get('/', async (req, res, next) => {
  try {
    const vehiculos = await vehiculoService.getAll();
    res.status(200).json(vehiculos);
  } catch (error) {
    console.log("=========================================================");
    console.error('Error al obtener vehículos:', error);
    console.log("=========================================================");
    next(error);
  }
});

vehiculoRouter.get('/:id', validateObjectIdParam(), async (req, res, next) => {
  try {
    const vehiculo = await vehiculoService.getById(req.params.id);
    res.status(200).json(vehiculo);
  } catch (error) {
    console.log("=========================================================");
    console.error(`Error al obtener vehículo con ID ${req.params.id}:`, error);
    console.log("=========================================================");
    next(error);
  }
});

vehiculoRouter.post('/', validateRequest(validateVehiculo), async (req, res, next) => {
  try {
    const vehiculo = await vehiculoService.create(req.body);
    res.status(201).json(vehiculo);
  } catch (error) {
    console.log("=========================================================");
    console.error('Error al crear vehículo:', error);
    console.log("=========================================================");
    next(error);
  }
});

vehiculoRouter.patch('/:id', validateObjectIdParam(), validateRequest(validateVehiculoPatch), async (req, res, next) => {
  try {
    const vehiculo = await vehiculoService.patch(req.params.id, req.body);
    res.status(200).json(vehiculo);
  } catch (error) {
    console.log("=========================================================");
    console.error(`Error al actualizar vehículo con ID ${req.params.id}:`, error);
    console.log("=========================================================");
    next(error);
  }
});

vehiculoRouter.delete('/:id', validateObjectIdParam(), async (req, res, next) => {
  try {
    await vehiculoService.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.log("=========================================================");
    console.error(`Error al eliminar vehículo con ID ${req.params.id}:`, error);
    console.log("=========================================================");
    next(error);
  }
});

module.exports = vehiculoRouter;
