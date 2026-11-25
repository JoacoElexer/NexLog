"use strict";

const mongoose = require('mongoose');

const zonaRepartoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    descripcion: { type: String, required: true, trim: true },
    centro: { type: mongoose.Schema.Types.ObjectId, ref: 'CentroDistribucion', required: true, index: true },
    geometria: {
      type: {
        type: String,
        required: true,
        default: 'Polygon',
      },
      coordinates: {
        type: [[[Number]]],
        required: true,
      },
    },
    estado: { type: String, required: true, default: 'activa' },
  },
  { timestamps: true, versionKey: false },
);

zonaRepartoSchema.index({ geometria: '2dsphere' });

module.exports = mongoose.model('ZonaReparto', zonaRepartoSchema, 'zonasreparto');
