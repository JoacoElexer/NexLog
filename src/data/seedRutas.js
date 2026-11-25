"use strict";

const Ruta = require('../models/Ruta');
const Entrega = require('../models/Entrega');

const ESTADOS_RUTA = ['planificada', 'en_curso', 'pausada', 'completada', 'cancelada'];

function buildRutasData(centrosDocs, repartidoresDocs, vehiculosDocs, entregasDocs) {
  return Array.from({ length: 15 }, (_, index) => {
    const num = String(index + 1).padStart(2, '0');
    const centro = centrosDocs[index];
    const entregaPrincipal = entregasDocs[index];
    const repartidor = index < 10 ? repartidoresDocs[index] : null;
    const vehiculo = index < 10 ? vehiculosDocs[index] : null;
    const centroCoords = centro.ubicacion.coordinates;
    const entregaCoords = entregaPrincipal.destino.coordinates;

    return {
      nombre: `Ruta Demo ${num}`,
      centro: centro.id,
      repartidor: repartidor ? repartidor.id : null,
      vehiculo: vehiculo ? vehiculo.id : null,
      paradas: [
        {
          entrega: entregaPrincipal.id,
          orden: 1,
        },
      ],
      geometria: {
        type: 'LineString',
        coordinates: [
          centroCoords,
          [
            Number(((centroCoords[0] + entregaCoords[0]) / 2).toFixed(4)),
            Number(((centroCoords[1] + entregaCoords[1]) / 2).toFixed(4)),
          ],
          entregaCoords,
        ],
      },
      estado: ESTADOS_RUTA[index % ESTADOS_RUTA.length],
    };
  });
}

async function syncEntregasConRutas(rutasDocs) {
  const updates = [];
  for (const ruta of rutasDocs) {
    for (const parada of ruta.paradas || []) {
      updates.push(
        Entrega.updateOne(
          { _id: parada.entrega, ruta: null },
          { $set: { ruta: ruta._id } },
        ),
      );
    }
  }
  if (updates.length > 0) {
    await Promise.all(updates);
  }
}

async function seedRutas(centrosDocs, repartidoresDocs, vehiculosDocs, entregasDocs) {
  const payload = buildRutasData(centrosDocs, repartidoresDocs, vehiculosDocs, entregasDocs);
  const nombres = payload.map((item) => item.nombre);
  const existingDocs = await Ruta.find({ nombre: { $in: nombres } });
  const existingByName = new Map(existingDocs.map((doc) => [doc.nombre, doc]));

  const missing = payload.filter((item) => !existingByName.has(item.nombre));
  if (missing.length > 0) {
    const inserted = await Ruta.insertMany(missing);
    inserted.forEach((doc) => existingByName.set(doc.nombre, doc));
  }

  const allDocs = payload.map((item) => existingByName.get(item.nombre));
  await syncEntregasConRutas(allDocs);

  return {
    total: existingByName.size,
    created: missing.length,
    docs: allDocs,
  };
}

module.exports = { buildRutasData, seedRutas };
