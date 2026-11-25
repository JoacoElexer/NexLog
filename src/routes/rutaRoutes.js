"use strict";

const express = require('express');
const RutaService = require('../services/rutaService');
const { validateRequest, validateObjectIdParam } = require('../middlewares/validateRequest');
const { validateRuta, validateRutaPatch } = require('../middlewares/Ruta_validator');

const rutaRouter = express.Router();
const rutaService = new RutaService();

rutaRouter.get('/', async (req, res, next) => {
  try {
    const rutas = await rutaService.getAll();
    res.status(200).json(rutas);
  } catch (error) {
    console.log("=========================================================");
    console.error('Error al obtener rutas:', error);
    console.log("=========================================================");
    next(error);
  }
});

rutaRouter.get('/geojson', async (req, res, next) => {
  try {
    const rutas = await rutaService.getGeoJson();
    res.status(200).json(rutas);
  } catch (error) {
    console.log("=========================================================");
    console.error('Error al obtener rutas en formato GeoJSON:', error);
    console.log("=========================================================");
    next(error);
  }
});

rutaRouter.get('/:id', validateObjectIdParam(), async (req, res, next) => {
  try {
    const ruta = await rutaService.getById(req.params.id);
    res.status(200).json(ruta);
  } catch (error) {
    console.log("=========================================================");
    console.error(`Error al obtener ruta con ID ${req.params.id}:`, error);
    console.log("=========================================================");
    next(error);
  }
});

rutaRouter.post('/', validateRequest(validateRuta), async (req, res, next) => {
  try {
    const ruta = await rutaService.create(req.body);
    res.status(201).json(ruta);
  } catch (error) {
    console.log("=========================================================");
    console.error('Error al crear ruta:', error);
    console.log("=========================================================");
    next(error);
  }
});

rutaRouter.patch('/:id', validateObjectIdParam(), validateRequest(validateRutaPatch), async (req, res, next) => {
  try {
    const ruta = await rutaService.patch(req.params.id, req.body);
    res.status(200).json(ruta);
  } catch (error) {
    console.log("=========================================================");
    console.error(`Error al actualizar ruta con ID ${req.params.id}:`, error);
    console.log("=========================================================");
    next(error);
  }
});

rutaRouter.delete('/:id', validateObjectIdParam(), async (req, res, next) => {
  try {
    await rutaService.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.log("=========================================================");
    console.error(`Error al eliminar ruta con ID ${req.params.id}:`, error);
    console.log("=========================================================");
    next(error);
  }
});

module.exports = rutaRouter;
