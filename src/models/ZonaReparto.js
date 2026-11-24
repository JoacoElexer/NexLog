const mongoose = require('mongoose');

const zonaRepartoSchema = new mongoose.Schema(
  {
    nombre: { type: String, trim: true },
    descripcion: { type: String, trim: true },
    centro: { type: mongoose.Schema.Types.ObjectId, ref: 'CentroDistribucion', index: true },
    geometria: {
      type: {
        type: String,
        default: 'Polygon',
      },
      coordinates: {
        type: [[[Number]]],
      },
    },
    estado: { type: String, default: 'activa' },
  },
  { timestamps: true, versionKey: false },
);

zonaRepartoSchema.index({ geometria: '2dsphere' });

module.exports = mongoose.model('ZonaReparto', zonaRepartoSchema, 'zonasreparto');
