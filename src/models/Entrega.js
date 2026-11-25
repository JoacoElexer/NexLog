"use strict";

const mongoose = require('mongoose');

const entregaSchema = new mongoose.Schema(
  {
    destinatario: {
      nombre: { type: String, required: true, trim: true },
      telefono: { type: String, trim: true },
    },
    categoria: { type: String, required: true, trim: true },
    direccionDestino: {
      calle: { type: String, required: true, trim: true },
      ciudad: { type: String, required: true, trim: true },
      estado: { type: String, required: true, trim: true },
    },
    destino: {
      type: { type: String, required: true, default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    centro: { type: mongoose.Schema.Types.ObjectId, ref: 'CentroDistribucion', default: null, index: true },
    zona: { type: mongoose.Schema.Types.ObjectId, ref: 'ZonaReparto', default: null, index: true },
    ruta: { type: mongoose.Schema.Types.ObjectId, ref: 'Ruta', default: null, index: true },
    estado: {
      type: String,
      required: true,
      default: 'pendiente',
      index: true,
    },
    observaciones: { type: String, trim: true },
  },
  { timestamps: true, versionKey: false },
);

entregaSchema.index({ destino: '2dsphere' });

module.exports = mongoose.model('Entrega', entregaSchema, 'entregas');
