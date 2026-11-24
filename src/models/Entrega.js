const mongoose = require('mongoose');

const entregaSchema = new mongoose.Schema(
  {
    destinatario: {
      nombre: { type: String, trim: true },
      telefono: { type: String, trim: true },
    },
    direccionDestino: {
      calle: { type: String, trim: true },
      ciudad: { type: String, trim: true },
      estado: { type: String, trim: true },
    },
    destino: {
      type: { type: String, default: 'Point' },
      coordinates: { type: [Number] },
    },
    centro: { type: mongoose.Schema.Types.ObjectId, ref: 'CentroDistribucion', default: null, index: true },
    zona: { type: mongoose.Schema.Types.ObjectId, ref: 'ZonaReparto', default: null, index: true },
    ruta: { type: mongoose.Schema.Types.ObjectId, ref: 'Ruta', default: null, index: true },
    estado: {
      type: String,
      default: 'pendiente',
      index: true,
    },
    observaciones: { type: String, trim: true },
  },
  { timestamps: true, versionKey: false },
);

entregaSchema.index({ destino: '2dsphere' });

module.exports = mongoose.model('Entrega', entregaSchema, 'entregas');
