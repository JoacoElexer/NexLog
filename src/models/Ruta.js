const mongoose = require('mongoose');

const paradaSchema = new mongoose.Schema(
  {
    entrega: { type: mongoose.Schema.Types.ObjectId, ref: 'Entrega' },
    orden: { type: Number },
  },
  { _id: false },
);

const rutaSchema = new mongoose.Schema(
  {
    nombre: { type: String, trim: true },
    centro: { type: mongoose.Schema.Types.ObjectId, ref: 'CentroDistribucion', index: true },
    repartidor: { type: mongoose.Schema.Types.ObjectId, ref: 'Repartidor', default: null, index: true },
    vehiculo: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehiculo', default: null, index: true },
    paradas: {
      type: [paradaSchema],
      default: [],
    },
    geometria: {
      type: {
        type: String,
        default: 'LineString',
      },
      coordinates: {
        type: [[Number]],
      },
    },
    estado: { type: String, default: 'planificada', index: true },
  },
  { timestamps: true, versionKey: false },
);

rutaSchema.index({ geometria: '2dsphere' });

module.exports = mongoose.model('Ruta', rutaSchema, 'rutas');
