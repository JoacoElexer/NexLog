"use strict";

const Vehiculo = require('../models/Vehiculo');
const { insertarFaltantes, ejecutarSeed } = require('./seedUtils');

// [marca, modelo, tipo] con los valores que acepta el validador.
const MODELOS = [
  ['Ford', 'Transit 2023', 'camioneta'],
  ['Toyota', 'Hiace 2022', 'camioneta'],
  ['Chevrolet', 'Express 2023', 'camioneta'],
  ['Ford', 'F-350 2021', 'camion'],
  ['Toyota', 'Hilux 2024', 'camioneta'],
  ['Chevrolet', 'Silverado 3500 2022', 'camion'],
];

const VEHICULOS_DATA = Array.from({ length: 15 }, (_, index) => {
  const [marca, modelo, tipo] = MODELOS[index % MODELOS.length];
  const estado = index < 10 ? 'asignado' : index < 13 ? 'disponible' : index === 13 ? 'mantenimiento' : 'inactivo';

  return {
    placa: `GT-${201 + index}-NX`,
    tipo,
    marca,
    modelo,
    estado,
  };
});

async function seedVehiculos() {
  return insertarFaltantes(Vehiculo, VEHICULOS_DATA, 'placa');
}

if (require.main === module) {
  ejecutarSeed('vehículos', seedVehiculos);
}

module.exports = { VEHICULOS_DATA, seedVehiculos };
