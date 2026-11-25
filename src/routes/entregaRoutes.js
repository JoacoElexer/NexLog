"use strict";

const express = require('express');
const EntregaService = require('../services/entregaService');
const { validateRequest, validateObjectIdParam } = require('../middlewares/validateRequest');
const { validateEntrega, validateEntregaPatch } = require('../middlewares/Entrega_validator');

const entregaRouter = express.Router();
const entregaService = new EntregaService();

entregaRouter.get('/', async (req, res, next) => {
  try {
    const entregas = await entregaService.getAll();
    res.status(200).json(entregas);
  } catch (error) {
    console.log("=========================================================");
    console.error('Error al obtener entregas:', error);
    console.log("=========================================================");
    next(error);
  }
});

entregaRouter.get('/geojson', async (req, res, next) => {
  try {
    const entregas = await entregaService.getGeoJson();
    res.status(200).json(entregas);
  } catch (error) {
    console.log("=========================================================");
    console.error('Error al obtener entregas en formato GeoJSON:', error);
    console.log("=========================================================");
    next(error);
  }
});

entregaRouter.get('/:id', validateObjectIdParam(), async (req, res, next) => {
  try {
    const entrega = await entregaService.getById(req.params.id);
    res.status(200).json(entrega);
  } catch (error) {
    console.log("=========================================================");
    console.error(`Error al obtener entrega con ID ${req.params.id}:`, error);
    console.log("=========================================================");
    next(error);
  }
});

entregaRouter.post('/', validateRequest(validateEntrega), async (req, res, next) => {
  try {
    const entrega = await entregaService.create(req.body);
    res.status(201).json(entrega);
  } catch (error) {
    console.log("=========================================================");
    console.error('Error al crear entrega:', error);
    console.log("=========================================================");
    next(error);
  }
});

entregaRouter.patch('/:id', validateObjectIdParam(), validateRequest(validateEntregaPatch), async (req, res, next) => {
  try {
    const entrega = await entregaService.patch(req.params.id, req.body);
    res.status(200).json(entrega);
  } catch (error) {
    console.log("=========================================================");
    console.error(`Error al actualizar entrega con ID ${req.params.id}:`, error);
    console.log("=========================================================");
    next(error);
  }
});

entregaRouter.delete('/:id', validateObjectIdParam(), async (req, res, next) => {
  try {
    await entregaService.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.log("=========================================================");
    console.error(`Error al eliminar entrega con ID ${req.params.id}:`, error);
    console.log("=========================================================");
    next(error);
  }
});

module.exports = entregaRouter;
