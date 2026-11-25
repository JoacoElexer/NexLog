"use strict";

const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    correo: { type: String, required: true, trim: true, lowercase: true, unique: true },
    passwordHash: { type: String, required: true, select: false },
    rol: { type: String, required: true, default: 'operador' },
    estado: { type: String, required: true, default: 'pendiente', index: true }
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model('Usuario', usuarioSchema, 'usuarios');
