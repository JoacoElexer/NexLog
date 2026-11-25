"use strict";

const mongoose = require('mongoose');
const { Schema } = mongoose;

const ubicacionSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true },
    descripcion: { type: String, trim: true },
    categoria: { type: Schema.Types.ObjectId, ref: 'Categoria', required: true, index: true },
    zona: { type: Schema.Types.ObjectId, ref: 'ZonaReparto', index: true },
    ubicacion: {
      type: { type: String, required: true, default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lon, lat]
    },
  },
  { timestamps: true, versionKey: false }
);

// 2dsphere index for geospatial queries
ubicacionSchema.index({ ubicacion: '2dsphere' });

module.exports = mongoose.model('Ubicacion', ubicacionSchema, 'ubicaciones');
