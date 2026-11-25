"use strict";

const Ruta = require('../models/Ruta');
const Entrega = require('../models/Entrega');
const CentroDistribucion = require('../models/CentroDistribucion');
const Repartidor = require('../models/Repartidor');
const Vehiculo = require('../models/Vehiculo');
const { CENTROS_DISTRIBUCION_DATA } = require('./seedCentrosDistribucion');
const { REPARTIDORES_DATA } = require('./seedRepartidores');
const { VEHICULOS_DATA } = require('./seedVehiculos');
const { buildEntregasData } = require('./seedEntregas');
const { insertarFaltantes, buscarRequeridos, ejecutarSeed } = require('./seedUtils');

const ESTADOS_RUTA = ['planificada', 'en_curso', 'pausada', 'completada', 'cancelada'];
const CENTROS_LEON = 5;

// Cada ruta sale del centro de León que atiende a su entrega principal.
function buildRutasData(centrosDocs, repartidoresDocs, vehiculosDocs, entregasDocs) {
  return Array.from({ length: 15 }, (_, index) => {
    const num = String(index + 1).padStart(2, '0');
    const centro = centrosDocs[index % CENTROS_LEON];
    const entregaPrincipal = entregasDocs[index];
    const repartidor = index < 10 ? repartidoresDocs[index] : null;
    const vehiculo = index < 10 ? vehiculosDocs[index] : null;
    const centroCoords = centro.ubicacion.coordinates;
    const entregaCoords = entregaPrincipal.destino.coordinates;
    const nombreCorto = centro.nombre.replace('CEDIS ', '');

    return {
      nombre: `Ruta ${nombreCorto} ${num}`,
      centro: centro.id,
      repartidor: repartidor ? repartidor.id : null,
      vehiculo: vehiculo ? vehiculo.id : null,
      paradas: [{ entrega: entregaPrincipal.id, orden: 1 }],
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
      updates.push(Entrega.updateOne({ _id: parada.entrega, ruta: null }, { $set: { ruta: ruta._id } }));
    }
  }
  if (updates.length > 0) await Promise.all(updates);
}

async function seedRutas(centrosDocs, repartidoresDocs, vehiculosDocs, entregasDocs) {
  const centros = centrosDocs || await buscarRequeridos(
    CentroDistribucion, CENTROS_DISTRIBUCION_DATA.map((c) => c.nombre), 'nombre', 'seed:centros');
  const repartidores = repartidoresDocs || await buscarRequeridos(
    Repartidor, REPARTIDORES_DATA.map((r) => r.nombre), 'nombre', 'seed:repartidores');
  const vehiculos = vehiculosDocs || await buscarRequeridos(
    Vehiculo, VEHICULOS_DATA.map((v) => v.placa), 'placa', 'seed:vehiculos');
  const entregas = entregasDocs || await buscarRequeridos(
    Entrega, buildEntregasData([], []).map((e) => e.destinatario.nombre), 'destinatario.nombre', 'seed:entregas');

  const resultado = await insertarFaltantes(Ruta, buildRutasData(centros, repartidores, vehiculos, entregas));
  await syncEntregasConRutas(resultado.docs);
  return resultado;
}

if (require.main === module) {
  ejecutarSeed('rutas', () => seedRutas());
}

module.exports = { buildRutasData, seedRutas };
