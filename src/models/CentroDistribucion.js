"use strict";

const mongoose = require('mongoose');

const { Schema } = mongoose;

const centroDistribucionSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true },
    gerente: { type: String, required: true, trim: true },
    direccion: { 
      calle: { type: String, required: true, trim: true },
      ciudad: { type: String, required: true, trim: true },
      estado: { type: String, required: true, trim: true }
    },
    ubicacion: {
      type: { type: String, required: true, default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    coberturaKm: { type: Number, required: true },
    estado: { type: String, required: true, default: 'operativo' },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

centroDistribucionSchema.index({ ubicacion: '2dsphere' });

module.exports = mongoose.model('CentroDistribucion', centroDistribucionSchema, 'centrosdistribucion');
