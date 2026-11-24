const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema(
  {
    nombre: { type: String, trim: true },
    correo: { type: String, trim: true, lowercase: true, unique: true },
    passwordHash: { type: String, select: false },
    rol: { type: String, default: 'operador' },
    estado: { type: String, default: 'pendiente', index: true }
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model('Usuario', usuarioSchema, 'usuarios');
