"use strict";

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const Usuario = require('../models/Usuario');
const UsuarioService = require('./usuarioService');

const usuarioService = new UsuarioService();

class AuthService {
  async register(data) {
    return usuarioService.create(data);
  }

  async login({ correo, password }) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new AppError(500, 'Configuración de autenticación incompleta.');
    }

    const correoNormalizado = correo.trim().toLowerCase();
    const usuario = await Usuario.findOne({ correo: correoNormalizado }).select('+passwordHash');

    if (!usuario) {
      throw new AppError(401, 'Credenciales inválidas.');
    }

    const passwordValida = await bcrypt.compare(password, usuario.passwordHash);
    if (!passwordValida) {
      throw new AppError(401, 'Credenciales inválidas.');
    }

    if (usuario.estado === 'pendiente') {
      throw new AppError(403, 'Tu cuenta está pendiente de aprobación administrativa.');
    }
    if (usuario.estado === 'rechazado') {
      throw new AppError(403, 'Tu solicitud de cuenta fue rechazada.');
    }
    if (usuario.estado !== 'aprobado') {
      throw new AppError(403, 'Tu cuenta no está habilitada para iniciar sesión.');
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || '8h';
    const token = jwt.sign(
      { sub: usuario.id, rol: usuario.rol },
      secret,
      { expiresIn },
    );

    return {
      token,
      usuario: {
        _id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        estado: usuario.estado,
      },
    };
  }

  async getProfile(userId) {
    return usuarioService.getById(userId);
  }
}

module.exports = AuthService;
