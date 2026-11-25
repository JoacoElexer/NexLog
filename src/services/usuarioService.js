"use strict";

const bcrypt = require('bcrypt');
const AppError = require('../utils/appError');
const Usuario = require('../models/Usuario');

const BCRYPT_SALT_ROUNDS = 10;

class UsuarioService {
  async getAll(filters = {}) {
    return Usuario.find(filters).sort({ nombre: 1 });
  }

  async getById(id) {
    const data = await Usuario.findById(id);
    if (!data) {
      throw new AppError(404, 'Usuario no encontrado.');
    }
    return data;
  }

  async create(data) {
    const correoNormalizado = data.correo.trim().toLowerCase();
    const existente = await Usuario.findOne({ correo: correoNormalizado });
    if (existente) {
      throw new AppError(400, 'Ya existe un usuario registrado con ese correo.');
    }

    const passwordHash = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);
    const created = await Usuario.create({
      nombre: data.nombre,
      correo: correoNormalizado,
      passwordHash,
      rol: 'operador',
      estado: 'pendiente',
    });

    return this.getById(created._id);
  }

  async patch(id, data) {
    const payload = { ...data };
    if ('password' in payload) {
      payload.passwordHash = await bcrypt.hash(payload.password, BCRYPT_SALT_ROUNDS);
      delete payload.password;
    }

    const updatedData = await Usuario.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });
    if (!updatedData) {
      throw new AppError(404, 'Usuario no encontrado.');
    }
    return updatedData;
  }

  async delete(id) {
    const deletedItem = await Usuario.findByIdAndDelete(id);
    if (!deletedItem) {
      throw new AppError(404, 'Usuario no encontrado.');
    }
    return deletedItem;
  }
}

module.exports = UsuarioService;