"use strict";

const express = require('express');
const ZonaRepartoService = require('../services/zonaRepartoService');
const { validateRequest, validateObjectIdParam } = require('../middlewares/validateRequest');
const { validateZonaReparto, validateZonaRepartoPatch } = require('../middlewares/ZonaReparto_validator');

const zonaRepartoRouter = express.Router();
const zonaRepartoService = new ZonaRepartoService();

zonaRepartoRouter.get('/', async (req, res, next) => {
  try {
    const zonas = await zonaRepartoService.getAll();
    res.status(200).json(zonas);
  } catch (error) {
    console.log("=========================================================");
    console.error('Error al obtener zonas de reparto:', error);
    console.log("=========================================================");
    next(error);
  }
});

zonaRepartoRouter.get('/geojson', async (req, res, next) => {
  try {
    const zonas = await zonaRepartoService.getGeoJson();
    res.status(200).json(zonas);
  } catch (error) {
    console.log("=========================================================");
    console.error('Error al obtener zonas de reparto en formato GeoJSON:', error);
    console.log("=========================================================");
    next(error);
  }
});

zonaRepartoRouter.get('/:id', validateObjectIdParam(), async (req, res, next) => {
  try {
    const zona = await zonaRepartoService.getById(req.params.id);
    res.status(200).json(zona);
  } catch (error) {
    console.log("=========================================================");
    console.error(`Error al obtener zona de reparto con ID ${req.params.id}:`, error);
    console.log("=========================================================");
    next(error);
  }
});

zonaRepartoRouter.post('/', validateRequest(validateZonaReparto), async (req, res, next) => {
  try {
    const zona = await zonaRepartoService.create(req.body);
    res.status(201).json(zona);
  } catch (error) {
    console.log("=========================================================");
    console.error('Error al crear zona de reparto:', error);
    console.log("=========================================================");
    next(error);
  }
});

zonaRepartoRouter.patch('/:id', validateObjectIdParam(), validateRequest(validateZonaRepartoPatch), async (req, res, next) => {
  try {
    const zona = await zonaRepartoService.patch(req.params.id, req.body);
    res.status(200).json(zona);
  } catch (error) {
    console.log("=========================================================");
    console.error(`Error al actualizar zona de reparto con ID ${req.params.id}:`, error);
    console.log("=========================================================");
    next(error);
  }
});

zonaRepartoRouter.delete('/:id', validateObjectIdParam(), async (req, res, next) => {
  try {
    await zonaRepartoService.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.log("=========================================================");
    console.error(`Error al eliminar zona de reparto con ID ${req.params.id}:`, error);
    console.log("=========================================================");
    next(error);
  }
});

module.exports = zonaRepartoRouter;
