"use strict";

const ZonaReparto = require('../models/ZonaReparto');
const { CENTROS_DISTRIBUCION_DATA } = require('./seedCentrosDistribucion');

function buildZonasRepartoData(centrosDocs) {
  return CENTROS_DISTRIBUCION_DATA.map((centroData, index) => {
    const num = String(index + 1).padStart(2, '0');
    const [lon, lat] = centroData.ubicacion.coordinates;
    const delta = 0.04;
    const centroDoc = centrosDocs[index];

    return {
      nombre: `Zona Demo ${num}`,
      descripcion: `Polígono de reparto de prueba ${num} vinculado a ${centroData.nombre}.`,
      centro: centroDoc ? centroDoc.id : undefined,
      geometria: {
        type: 'Polygon',
        coordinates: [[
          [Number((lon - delta).toFixed(4)), Number((lat - delta).toFixed(4))],
          [Number((lon + delta).toFixed(4)), Number((lat - delta).toFixed(4))],
          [Number((lon + delta).toFixed(4)), Number((lat + delta).toFixed(4))],
          [Number((lon - delta).toFixed(4)), Number((lat + delta).toFixed(4))],
          [Number((lon - delta).toFixed(4)), Number((lat - delta).toFixed(4))],
        ]],
      },
      estado: index % 6 === 5 ? 'inactiva' : 'activa',
    };
  });
}

async function seedZonasReparto(centrosDocs) {
  const payload = buildZonasRepartoData(centrosDocs);
  const nombres = payload.map((item) => item.nombre);
  const existingDocs = await ZonaReparto.find({ nombre: { $in: nombres } });
  const existingByName = new Map(existingDocs.map((doc) => [doc.nombre, doc]));

  const missing = payload.filter((item) => !existingByName.has(item.nombre));
  if (missing.length > 0) {
    const inserted = await ZonaReparto.insertMany(missing);
    inserted.forEach((doc) => existingByName.set(doc.nombre, doc));
  }

  return {
    total: existingByName.size,
    created: missing.length,
    docs: payload.map((item) => existingByName.get(item.nombre)),
  };
}

module.exports = { buildZonasRepartoData, seedZonasReparto };
