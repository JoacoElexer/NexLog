"use strict";

const CentroDistribucion = require('../models/CentroDistribucion');

const CENTROS_DISTRIBUCION_DATA = Array.from({ length: 15 }, (_, index) => {
  const num = String(index + 1).padStart(2, '0');
  const col = index % 5;
  const row = Math.floor(index / 5);
  const lon = Number((-100.4 + col * 0.12).toFixed(4));
  const lat = Number((20.5 + row * 0.12).toFixed(4));

  return {
    nombre: `Centro Demo ${num}`,
    gerente: `Gerente Prueba ${num}`,
    direccion: {
      calle: `Avenida Logística Prueba ${100 + index}`,
      ciudad: `Ciudad Demo ${row + 1}`,
      estado: 'Estado Demo',
    },
    ubicacion: {
      type: 'Point',
      coordinates: [lon, lat],
    },
    coberturaKm: 15 + (index % 4) * 5,
    estado: index % 7 === 6 ? 'inactivo' : 'operativo',
  };
});

async function seedCentrosDistribucion() {
  const nombres = CENTROS_DISTRIBUCION_DATA.map((item) => item.nombre);
  const existingDocs = await CentroDistribucion.find({ nombre: { $in: nombres } });
  const existingByName = new Map(existingDocs.map((doc) => [doc.nombre, doc]));

  const missing = CENTROS_DISTRIBUCION_DATA.filter((item) => !existingByName.has(item.nombre));
  if (missing.length > 0) {
    const inserted = await CentroDistribucion.insertMany(missing);
    inserted.forEach((doc) => existingByName.set(doc.nombre, doc));
  }

  return {
    total: existingByName.size,
    created: missing.length,
    docs: CENTROS_DISTRIBUCION_DATA.map((item) => existingByName.get(item.nombre)),
  };
}

module.exports = { CENTROS_DISTRIBUCION_DATA, seedCentrosDistribucion };
