"use strict";

const express = require('express');
const AuthService = require('../services/authService');
const { validateRequest } = require('../middlewares/validateRequest');
const { validateRegistroUsuario, validateLogin } = require('../middlewares/Usuario_validator');
const { authenticate } = require('../middlewares/auth_middleware');

const authRouter = express.Router();
const authService = new AuthService();

authRouter.post('/register', validateRequest(validateRegistroUsuario), async (req, res, next) => {
  try {
    const usuario = await authService.register(req.body);
    res.status(201).json({
      message: 'Registro recibido. Tu cuenta queda pendiente de aprobación administrativa.',
      usuario,
    });
  } catch (error) {
    console.log("=========================================================");
    console.error('Error al registrar usuario:', error.message);
    console.log("=========================================================");
    next(error);
  }
});

authRouter.post('/login', validateRequest(validateLogin), async (req, res, next) => {
  try {
    const session = await authService.login(req.body);
    res.status(200).json(session);
  } catch (error) {
    console.log("=========================================================");
    console.error('Error al iniciar sesión:', error.message);
    console.log("=========================================================");
    next(error);
  }
});

authRouter.get('/me', authenticate, async (req, res, next) => {
  try {
    const usuario = await authService.getProfile(req.user.id);
    res.status(200).json(usuario);
  } catch (error) {
    console.log("=========================================================");
    console.error('Error al obtener perfil autenticado:', error.message);
    console.log("=========================================================");
    next(error);
  }
});

module.exports = authRouter;
