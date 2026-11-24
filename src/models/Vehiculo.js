const mongoose = require('mongoose');

const vehiculoSchema = new mongoose.Schema(
  {
    placa: { type: String, trim: true, uppercase: true, unique: true },
    tipo: { type: String, trim: true },
    marca: { type: String, trim: true },
    modelo: { type: String, trim: true },
    estado: { type: String, default: 'disponible' },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model('Vehiculo', vehiculoSchema, 'vehiculos');
