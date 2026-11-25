"use strict";

const ZonaReparto = require('../models/ZonaReparto');
const CentroDistribucion = require('../models/CentroDistribucion');
const { CENTROS_DISTRIBUCION_DATA } = require('./seedCentrosDistribucion');
const { insertarFaltantes, buscarRequeridos, ejecutarSeed } = require('./seedUtils');

// Rectángulo [latMin, latMax, lonMin, lonMax] convertido a Polygon GeoJSON cerrado.
function rectangulo([latMin, latMax, lonMin, lonMax]) {
  return {
    type: 'Polygon',
    coordinates: [[
      [lonMin, latMin],
      [lonMax, latMin],
      [lonMax, latMax],
      [lonMin, latMax],
      [lonMin, latMin],
    ]],
  };
}

// Zonas de León: no se enciman entre sí y cada una contiene a su centro.
const LIMITES_LEON = {
  'CEDIS León Centro': [21.105, 21.135, -101.700, -101.650],
  'CEDIS León Norte': [21.135, 21.180, -101.710, -101.640],
  'CEDIS León Sur': [21.060, 21.105, -101.700, -101.645],
  'CEDIS León Oriente': [21.090, 21.135, -101.640, -101.580],
  'CEDIS León Poniente': [21.105, 21.150, -101.770, -101.712],
};

function limitesDe(centroData) {
  if (LIMITES_LEON[centroData.nombre]) return LIMITES_LEON[centroData.nombre];
  const [lon, lat] = centroData.ubicacion.coordinates;
  const d = 0.018;
  return [
    Number((lat - d).toFixed(4)),
    Number((lat + d).toFixed(4)),
    Number((lon - d).toFixed(4)),
    Number((lon + d).toFixed(4)),
  ];
}

function buildZonasRepartoData(centrosDocs) {
  return CENTROS_DISTRIBUCION_DATA.map((centroData, index) => {
    const nombreCorto = centroData.nombre.replace('CEDIS ', '');
    return {
      nombre: `Zona ${nombreCorto}`,
      descripcion: `Área de reparto atendida por ${centroData.nombre}.`,
      centro: centrosDocs[index] ? centrosDocs[index].id : undefined,
      geometria: rectangulo(limitesDe(centroData)),
      estado: centroData.estado === 'inactivo' ? 'inactiva' : 'activa',
    };
  });
}

async function seedZonasReparto(centrosDocs) {
  const centros = centrosDocs || await buscarRequeridos(
    CentroDistribucion,
    CENTROS_DISTRIBUCION_DATA.map((c) => c.nombre),
    'nombre',
    'seed:centros',
  );
  return insertarFaltantes(ZonaReparto, buildZonasRepartoData(centros));
}

if (require.main === module) {
  ejecutarSeed('zonas de reparto', () => seedZonasReparto());
}

module.exports = { buildZonasRepartoData, seedZonasReparto };
