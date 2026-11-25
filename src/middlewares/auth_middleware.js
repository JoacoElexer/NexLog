"use strict";

const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const Usuario = require('../models/Usuario');

function extractBearerToken(authorizationHeader) {
  if (typeof authorizationHeader !== 'string') return null;
  const [scheme, token] = authorizationHeader.trim().split(/\s+/);
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

async function authenticate(req, res, next) {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next(new AppError(500, 'Configuración de autenticación incompleta.'));
    }

    const token = extractBearerToken(req.headers.authorization);
    if (!token) {
      return next(new AppError(401, 'Autenticación requerida.'));
    }

    let payload;
    try {
      payload = jwt.verify(token, secret);
    } catch {
      return next(new AppError(401, 'Token inválido o expirado.'));
    }

    const usuario = await Usuario.findById(payload.sub);
    if (!usuario) {
      return next(new AppError(401, 'Sesión inválida.'));
    }

    if (usuario.estado !== 'aprobado') {
      return next(new AppError(403, 'La cuenta no está aprobada para acceder al sistema.'));
    }

    req.user = usuario;
    next();
  } catch (error) {
    next(error);
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError(401, 'Autenticación requerida.'));
    }
    if (!allowedRoles.includes(req.user.rol)) {
      return next(new AppError(403, 'No tienes permisos para realizar esta acción.'));
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
