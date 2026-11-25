"use strict";

const express = require('express');
const UbicacionService = require('../services/ubicacionService');
const { validateRequest, validateObjectIdParam } = require('../middlewares/validateRequest');
const { validateUbicacion, validateUbicacionPatch } = require('../middlewares/Ubicacion_validator');

const router = express.Router();
const service = new UbicacionService();

// List with optional filters: nombre, categoria, zona, format=geojson
router.get('/', async (req, res, next) => {
  try {
    const { nombre, categoria, zona, format } = req.query;
    const filters = {};
    if (nombre) filters.nombre = nombre;
    if (categoria) filters.categoria = categoria;
    if (zona) filters.zona = zona;
    if (format === 'geojson') {
      const geojson = await service.getGeoJson(filters);
      return res.status(200).json(geojson);
    }
    const data = await service.getAll(filters);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', validateObjectIdParam(), async (req, res, next) => {
  try {
    const data = await service.getById(req.params.id);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/', validateRequest(validateUbicacion), async (req, res, next) => {
  try {
    const created = await service.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', validateObjectIdParam(), validateRequest(validateUbicacionPatch), async (req, res, next) => {
  try {
    const updated = await service.patch(req.params.id, req.body);
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', validateObjectIdParam(), async (req, res, next) => {
  try {
    await service.delete(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
