"use strict";

require('dotenv').config();

const { connectDatabase, disconnectDatabase } = require('../config/database');
const { seedAdmins } = require('./seedAdmins');
const { seedCentrosDistribucion } = require('./seedCentrosDistribucion');
const { seedZonasReparto } = require('./seedZonasReparto');
const { seedRepartidores } = require('./seedRepartidores');
const { seedVehiculos } = require('./seedVehiculos');
const { seedEntregas } = require('./seedEntregas');
const { seedRutas } = require('./seedRutas');

async function seedAll({ includeAdmins = true } = {}) {
  const admins = includeAdmins ? await seedAdmins({ strict: false }) : [];
  const centros = await seedCentrosDistribucion();
  const zonas = await seedZonasReparto(centros.docs);
  const repartidores = await seedRepartidores();
  const vehiculos = await seedVehiculos();
  const entregas = await seedEntregas(centros.docs, zonas.docs);
  const rutas = await seedRutas(centros.docs, repartidores.docs, vehiculos.docs, entregas.docs);

  return {
    admins,
    centros: { total: centros.total, created: centros.created },
    zonas: { total: zonas.total, created: zonas.created },
    repartidores: { total: repartidores.total, created: repartidores.created },
    vehiculos: { total: vehiculos.total, created: vehiculos.created },
    entregas: { total: entregas.total, created: entregas.created },
    rutas: { total: rutas.total, created: rutas.created },
  };
}

if (require.main === module) {
  (async () => {
    try {
      await connectDatabase();
      const summary = await seedAll();
      console.log('Resultado del seed de datos demo:', summary);
    } catch (error) {
      console.error('Error ejecutando el seed general:', error.message);
      process.exitCode = 1;
    } finally {
      await disconnectDatabase();
    }
  })();
}

module.exports = { seedAll };
