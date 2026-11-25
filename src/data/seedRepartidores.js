"use strict";

const Repartidor = require('../models/Repartidor');
const { insertarFaltantes, ejecutarSeed } = require('./seedUtils');

const NOMBRES = [
  'Juan Pérez Gómez', 'María López Hernández', 'Luis Hernández Ruiz', 'Ana Ramírez Torres',
  'Carlos Martínez Díaz', 'Sofía García Morales', 'Jorge Sánchez Flores', 'Fernanda Cruz Ortiz',
  'Ricardo Mendoza Vargas', 'Daniela Castillo Reyes', 'Miguel Ángel Rojas Peña', 'Paola Jiménez Salas',
  'Alejandro Navarro Ponce', 'Valeria Gutiérrez Luna', 'Eduardo Aguilar Campos',
];

// Teléfonos con lada de León (477) y el prefijo 555, que se usa para datos de ejemplo.
const REPARTIDORES_DATA = NOMBRES.map((nombre, index) => ({
  nombre,
  telefono: `477 555 ${String(101 + index).padStart(4, '0')}`,
  estado: index < 10 ? 'asignado' : index < 13 ? 'disponible' : 'inactivo',
}));

async function seedRepartidores() {
  return insertarFaltantes(Repartidor, REPARTIDORES_DATA);
}

if (require.main === module) {
  ejecutarSeed('repartidores', seedRepartidores);
}

module.exports = { REPARTIDORES_DATA, seedRepartidores };
