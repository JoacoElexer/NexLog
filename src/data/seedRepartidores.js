"use strict";

const Repartidor = require('../models/Repartidor');

const ESTADOS = ['disponible', 'asignado', 'inactivo'];

const REPARTIDORES_DATA = Array.from({ length: 15 }, (_, index) => {
  const num = String(index + 1).padStart(2, '0');
  const estado = index < 10 ? 'asignado' : index < 13 ? 'disponible' : 'inactivo';

  return {
    nombre: `Repartidor Prueba ${num}`,
    telefono: `555-010-${1000 + index}`,
    estado: ESTADOS.includes(estado) ? estado : 'disponible',
  };
});

async function seedRepartidores() {
  const nombres = REPARTIDORES_DATA.map((item) => item.nombre);
  const existingDocs = await Repartidor.find({ nombre: { $in: nombres } });
  const existingByName = new Map(existingDocs.map((doc) => [doc.nombre, doc]));

  const missing = REPARTIDORES_DATA.filter((item) => !existingByName.has(item.nombre));
  if (missing.length > 0) {
    const inserted = await Repartidor.insertMany(missing);
    inserted.forEach((doc) => existingByName.set(doc.nombre, doc));
  }

  return {
    total: existingByName.size,
    created: missing.length,
    docs: REPARTIDORES_DATA.map((item) => existingByName.get(item.nombre)),
  };
}

module.exports = { REPARTIDORES_DATA, seedRepartidores };
