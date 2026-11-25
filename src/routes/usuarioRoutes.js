"use strict";

const express = require('express');
const { validateRequest, validateObjectIdParam } = require('../middlewares/validateRequest');
const { validateRegistroUsuario, validateUsuarioPatch } = require('../middlewares/Usuario_validator');
const UsuarioService = require('../services/usuarioService');

const usuarioRouter = express.Router();
const usuarioService = new UsuarioService();

usuarioRouter.get('/', async (req, res, next) => {
  try {
    const usuarios = await usuarioService.getAll();
    res.status(200).json(usuarios);
  } catch (error) {
    console.log("=========================================================");
    console.error('Error al obtener usuarios:', error);
    console.log("=========================================================");
    next(error);
  }
});

usuarioRouter.get('/:id', validateObjectIdParam(), async (req, res, next) => {
  try {
    const usuario = await usuarioService.getById(req.params.id);
    res.status(200).json(usuario);
  } catch (error) {
    console.log("=========================================================");
    console.error(`Error al obtener usuario con ID ${req.params.id}:`, error);
    console.log("=========================================================");
    next(error);
  }
});

usuarioRouter.post('/', validateRequest(validateRegistroUsuario), async (req, res, next) => {
  try {
    const usuario = await usuarioService.create(req.body);
    res.status(201).json(usuario);
  } catch (error) {
    console.log("=========================================================");
    console.error('Error al registrar usuario:', error);
    console.log("=========================================================");
    next(error);
  }
});

usuarioRouter.patch('/:id', validateObjectIdParam(), validateRequest(validateUsuarioPatch), async (req, res, next) => {
  try {
    const usuario = await usuarioService.patch(req.params.id, req.body);
    res.status(200).json(usuario);
  } catch (error) {
    console.log("=========================================================");
    console.error(`Error al actualizar usuario con ID ${req.params.id}:`, error);
    console.log("=========================================================");
    next(error);
  }
});

usuarioRouter.delete('/:id', validateObjectIdParam(), async (req, res, next) => {
  try {
    await usuarioService.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.log("=========================================================");
    console.error(`Error al eliminar usuario con ID ${req.params.id}:`, error);
    console.log("=========================================================");
    next(error);
  }
});

module.exports = usuarioRouter;
