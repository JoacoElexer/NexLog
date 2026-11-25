"use strict";

const express = require('express');
const CentroDistribucionService = require('../services/centroDistribucionService');
const { validateRequest, validateObjectIdParam } = require('../middlewares/validateRequest');
const {
  validateCentroDistribucion,
  validateCentroDistribucionPatch,
} = require('../middlewares/CentroDistribucion_validator');

const centroDistribucionRouter = express.Router();
const centroDistribucionService = new CentroDistribucionService();

centroDistribucionRouter.get('/', async (req, res, next) => {
  try {
    const centros = await centroDistribucionService.getAll();
    res.status(200).json(centros);
  } catch (error) {
    console.log("=========================================================");    
    console.error('Error al obtener centros de distribución:', error);
    console.log("=========================================================");
    next(error);
  }
});

centroDistribucionRouter.get('/geojson', async (req, res, next) => {
  try {
    const centros = await centroDistribucionService.getGeoJson();
    res.status(200).json(centros);
  } catch (error) {
    console.log("=========================================================");    
    console.error('Error al obtener centros de distribución en formato GeoJSON:', error);
    console.log("=========================================================");
    next(error);
  }
});

centroDistribucionRouter.get('/:id', validateObjectIdParam(), async (req, res, next) => {
  try {
    const centro = await centroDistribucionService.getById(req.params.id);
    res.status(200).json(centro);
  } catch (error) {
    console.log("=========================================================");    
    console.error(`Error al obtener centro de distribución con ID ${req.params.id}:`, error);
    console.log("=========================================================");
    next(error);
  }
});

centroDistribucionRouter.post('/', validateRequest(validateCentroDistribucion), async (req, res, next) => {
  try {
    const centro = await centroDistribucionService.create(req.body);
    res.status(201).json(centro);
  } catch (error) {
    console.log("=========================================================");    
    console.error('Error al crear centro de distribución:', error);
    console.log("=========================================================");
    next(error);
  }
});

centroDistribucionRouter.patch('/:id', validateObjectIdParam(), validateRequest(validateCentroDistribucionPatch), async (req, res, next) => {
  try {
    const centro = await centroDistribucionService.patch(req.params.id, req.body);
    res.status(200).json(centro);
  } catch (error) {
    console.log("=========================================================");    
    console.error(`Error al actualizar centro de distribución con ID ${req.params.id}:`, error);
    console.log("=========================================================");
    next(error);
  }
});

centroDistribucionRouter.delete('/:id', validateObjectIdParam(), async (req, res, next) => {
  try {
    await centroDistribucionService.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.log("=========================================================");    
    console.error(`Error al eliminar centro de distribución con ID ${req.params.id}:`, error);
    console.log("=========================================================");
    next(error);
  }
});

module.exports = centroDistribucionRouter;
