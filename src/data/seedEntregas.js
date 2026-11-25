"use strict";

const Entrega = require('../models/Entrega');
const { CENTROS_DISTRIBUCION_DATA } = require('./seedCentrosDistribucion');

const CATEGORIAS = ['Express', 'Estándar', 'Frágil', 'Documentación', 'Comercio'];

function buildEntregasData(centrosDocs, zonasDocs) {
  return Array.from({ length: 18 }, (_, index) => {
    const num = String(index + 1).padStart(2, '0');
    const centroIndex = index % CENTROS_DISTRIBUCION_DATA.length;
    const [baseLon, baseLat] = CENTROS_DISTRIBUCION_DATA[centroIndex].ubicacion.coordinates;
    const lonOffset = index % 2 === 0 ? 0.015 : -0.015;
    const latOffset = index % 3 === 0 ? 0.012 : -0.012;
    const sinCobertura = index >= 15;

    let estado = 'pendiente';
    if (!sinCobertura) {
      if (index % 5 === 0) estado = 'en_ruta';
      else if (index % 5 === 1) estado = 'asignada';
      else if (index % 5 === 2) estado = 'entregada';
      else if (index % 5 === 3) estado = 'asignada';
      else estado = 'incidencia';
    }

    return {
      destinatario: {
        nombre: `Destinatario Prueba ${num}`,
        telefono: `555-020-${2000 + index}`,
      },
      categoria: CATEGORIAS[index % CATEGORIAS.length],
      direccionDestino: {
        calle: `Calle Prueba ${200 + index}`,
        ciudad: `Ciudad Demo ${(centroIndex % 3) + 1}`,
        estado: 'Estado Demo',
      },
      destino: {
        type: 'Point',
        coordinates: [
          Number((baseLon + (sinCobertura ? 0.45 : lonOffset)).toFixed(4)),
          Number((baseLat + (sinCobertura ? 0.45 : latOffset)).toFixed(4)),
        ],
      },
      centro: sinCobertura ? null : centrosDocs[centroIndex]?.id || null,
      zona: sinCobertura ? null : zonasDocs[centroIndex]?.id || null,
      ruta: null,
      estado,
      observaciones: `Entrega de prueba #${num}${sinCobertura ? ' (fuera de cobertura demo)' : ''}.`,
    };
  });
}

async function seedEntregas(centrosDocs, zonasDocs) {
  const payload = buildEntregasData(centrosDocs, zonasDocs);
  const nombres = payload.map((item) => item.destinatario.nombre);
  const existingDocs = await Entrega.find({ 'destinatario.nombre': { $in: nombres } });
  const existingByDestinatario = new Map(existingDocs.map((doc) => [doc.destinatario.nombre, doc]));

  const missing = payload.filter((item) => !existingByDestinatario.has(item.destinatario.nombre));
  if (missing.length > 0) {
    const inserted = await Entrega.insertMany(missing);
    inserted.forEach((doc) => existingByDestinatario.set(doc.destinatario.nombre, doc));
  }

  return {
    total: existingByDestinatario.size,
    created: missing.length,
    docs: payload.map((item) => existingByDestinatario.get(item.destinatario.nombre)),
  };
}

module.exports = { buildEntregasData, seedEntregas };
