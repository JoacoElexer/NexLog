"use strict";

const express = require('express');
const CategoriaService = require('../services/categoriaService');
const { validateRequest, validateObjectIdParam } = require('../middlewares/validateRequest');
const { validateCategoria, validateCategoriaPatch } = require('../middlewares/Categoria_validator');

const router = express.Router();
const service = new CategoriaService();

router.get('/', async (req, res, next) => {
  try {
    const ubicaciones = await ubicacionService.getAll(req.query);
    res.status(200).json(ubicaciones);
  } catch (error) {
    next(error);
  }
});

router.get('/geojson', async (req, res, next) => {
  try {
    const ubicaciones = await ubicacionService.getGeoJson(req.query);
    res.status(200).json(ubicaciones);
  } catch (error) {
    next(error);
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

router.post('/', validateRequest(validateCategoria), async (req, res, next) => {
  try {
    const created = await service.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', validateObjectIdParam(), validateRequest(validateCategoriaPatch), async (req, res, next) => {
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
