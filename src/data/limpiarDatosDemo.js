"use strict";

// Borra los datos de demostración anteriores (Centro Demo, Zona Demo, Punto de
// referencia, Repartidor Prueba, placas DEM-, Destinatario Prueba y Ruta Demo).
// No toca a los usuarios. Las categorías antiguas solo se borran si ninguna
// ubicación las usa.

const Ubicacion = require('../models/Ubicacion');
const ZonaReparto = require('../models/ZonaReparto');
const CentroDistribucion = require('../models/CentroDistribucion');
const Repartidor = require('../models/Repartidor');
const Vehiculo = require('../models/Vehiculo');
const Entrega = require('../models/Entrega');
const Ruta = require('../models/Ruta');
const Categoria = require('../models/Categoria');
const { ejecutarSeed } = require('./seedUtils');

const CATEGORIAS_ANTIGUAS = ['Comercial', 'Servicios', 'Residencial', 'Industrial', 'Institucional'];

async function limpiarDatosDemo() {
  const borrados = {
    rutas: (await Ruta.deleteMany({ nombre: /^Ruta Demo/ })).deletedCount,
    entregas: (await Entrega.deleteMany({ 'destinatario.nombre': /^Destinatario Prueba/ })).deletedCount,
    ubicaciones: (await Ubicacion.deleteMany({ nombre: /^Punto de referencia/ })).deletedCount,
    zonas: (await ZonaReparto.deleteMany({ nombre: /^Zona Demo/ })).deletedCount,
    centros: (await CentroDistribucion.deleteMany({ nombre: /^Centro Demo/ })).deletedCount,
    repartidores: (await Repartidor.deleteMany({ nombre: /^Repartidor Prueba/ })).deletedCount,
    vehiculos: (await Vehiculo.deleteMany({ placa: /^DEM-/ })).deletedCount,
  };

  const antiguas = await Categoria.find({ nombre: { $in: CATEGORIAS_ANTIGUAS } });
  let categorias = 0;
  for (const categoria of antiguas) {
    const enUso = await Ubicacion.exists({ categoria: categoria._id });
    if (!enUso) {
      await categoria.deleteOne();
      categorias += 1;
    }
  }
  borrados.categorias = categorias;

  console.log('Registros de demostración borrados:', borrados);
  const total = Object.values(borrados).reduce((suma, n) => suma + n, 0);
  return { created: 0, total };
}

if (require.main === module) {
  ejecutarSeed('limpieza de datos demo', limpiarDatosDemo);
}

module.exports = { limpiarDatosDemo };
