const mongoose = require('mongoose');

const { Schema } = mongoose;

const centroDistribucionSchema = new Schema(
  {
    nombre: { type: String, trim: true },
    gerente: { type: String, trim: true },
    direccion: { 
      calle: { type: String, trim: true },
      ciudad: { type: String, trim: true },
      estado: { type: String, trim: true }
    },
    ubicacion: {
      type: { type: String, default: 'Point' },
      coordinates: { type: [Number] },
    },
    coberturaKm: { type: Number },
    estado: { type: String, default: 'operativo' },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

centroDistribucionSchema.index({ ubicacion: '2dsphere' });

module.exports = mongoose.model('CentroDistribucion', centroDistribucionSchema, 'centrosdistribucion');
