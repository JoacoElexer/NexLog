"use strict";

require('dotenv').config();

const { connectDatabase, disconnectDatabase } = require('../config/database');

function leerClave(objeto, clave) {
  return clave.split('.').reduce((valor, parte) => (valor ? valor[parte] : undefined), objeto);
}

// Inserta solo los registros que todavía no existen, comparando por la clave indicada.
// Así el seed se puede ejecutar varias veces sin duplicar datos.
async function insertarFaltantes(Modelo, datos, clave = 'nombre') {
  const valores = datos.map((item) => leerClave(item, clave));
  const existentes = await Modelo.find({ [clave]: { $in: valores } });
  const porClave = new Map(existentes.map((doc) => [leerClave(doc, clave), doc]));

  const faltantes = datos.filter((item) => !porClave.has(leerClave(item, clave)));
  if (faltantes.length > 0) {
    const insertados = await Modelo.insertMany(faltantes);
    insertados.forEach((doc) => porClave.set(leerClave(doc, clave), doc));
  }

  return {
    total: porClave.size,
    created: faltantes.length,
    docs: datos.map((item) => porClave.get(leerClave(item, clave))),
  };
}

// Busca en la base los registros de los que depende un seed (por ejemplo, los centros
// que necesitan las zonas). Si falta alguno, indica qué seed hay que ejecutar antes.
async function buscarRequeridos(Modelo, valores, clave, seedPrevio) {
  const docs = await Modelo.find({ [clave]: { $in: valores } });
  const porClave = new Map(docs.map((doc) => [leerClave(doc, clave), doc]));
  const faltantes = valores.filter((valor) => !porClave.has(valor));

  if (faltantes.length > 0) {
    throw new Error(`Faltan ${faltantes.length} registros requeridos. Ejecuta primero: npm run ${seedPrevio}`);
  }

  return valores.map((valor) => porClave.get(valor));
}

// Permite ejecutar cada archivo de seed por separado: conecta, inserta y desconecta.
async function ejecutarSeed(nombre, seed) {
  try {
    await connectDatabase();
    const resultado = await seed();
    console.log(`Seed de ${nombre}: ${resultado.created} creados, ${resultado.total} en total.`);
  } catch (error) {
    console.error(`Error en el seed de ${nombre}:`, error.message);
    process.exitCode = 1;
  } finally {
    await disconnectDatabase();
  }
}

module.exports = { insertarFaltantes, buscarRequeridos, ejecutarSeed };
