const mongoose = require('mongoose');

const repartidorSchema = new mongoose.Schema(
  {
    nombre: { type: String, trim: true },
    telefono: { type: String, trim: true },
    estado: { type: String, default: 'disponible' },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model('Repartidor', repartidorSchema, 'repartidores');
