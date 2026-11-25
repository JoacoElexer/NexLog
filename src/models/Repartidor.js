"use strict";

const mongoose = require('mongoose');

const repartidorSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    telefono: { type: String, required: true, trim: true },
    estado: { type: String, required: true, default: 'disponible' },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model('Repartidor', repartidorSchema, 'repartidores');
