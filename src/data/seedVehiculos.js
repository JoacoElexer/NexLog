"use strict";

const Vehiculo = require('../models/Vehiculo');

const MARCAS = ['Ford', 'Toyota', 'Chevrolet'];
const MODELOS = {
  Ford: ['Transit Demo', 'F-350 Demo'],
  Toyota: ['Hiace Demo', 'Hilux Demo'],
  Chevrolet: ['Express Demo', 'Silverado Demo'],
};

const VEHICULOS_DATA = Array.from({ length: 15 }, (_, index) => {
  const num = String(index + 1).padStart(2, '0');
  const marca = MARCAS[index % MARCAS.length];
  const tipo = index % 2 === 0 ? 'camioneta' : 'camion';
  const modelo = MODELOS[marca][index % 2];
  const estado = index < 10 ? 'asignado' : index < 13 ? 'disponible' : index === 13 ? 'mantenimiento' : 'inactivo';

  return {
    placa: `DEM-${100 + index}`,
    tipo,
    marca,
    modelo: `${modelo} ${num}`,
    estado,
  };
});

async function seedVehiculos() {
  const placas = VEHICULOS_DATA.map((item) => item.placa);
  const existingDocs = await Vehiculo.find({ placa: { $in: placas } });
  const existingByPlaca = new Map(existingDocs.map((doc) => [doc.placa, doc]));

  const missing = VEHICULOS_DATA.filter((item) => !existingByPlaca.has(item.placa));
  if (missing.length > 0) {
    const inserted = await Vehiculo.insertMany(missing);
    inserted.forEach((doc) => existingByPlaca.set(doc.placa, doc));
  }

  return {
    total: existingByPlaca.size,
    created: missing.length,
    docs: VEHICULOS_DATA.map((item) => existingByPlaca.get(item.placa)),
  };
}

module.exports = { VEHICULOS_DATA, seedVehiculos };
