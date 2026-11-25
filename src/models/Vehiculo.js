"use strict";

const mongoose = require('mongoose');

const vehiculoSchema = new mongoose.Schema(
  {
    placa: { type: String, required: true, trim: true, uppercase: true, unique: true },
    tipo: { type: String, required: true, trim: true },
    marca: { type: String, required: true, trim: true },
    modelo: { type: String, required: true, trim: true },
    estado: { type: String, required: true, default: 'disponible' },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model('Vehiculo', vehiculoSchema, 'vehiculos');
