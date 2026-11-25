"use strict";

const Categoria = require('../models/Categoria');
const { insertarFaltantes, ejecutarSeed } = require('./seedUtils');

const CATEGORIAS_DATA = [
  { nombre: 'Almacén', descripcion: 'Bodegas y andenes donde se resguarda y prepara la mercancía.' },
  { nombre: 'Punto de entrega', descripcion: 'Clientes y negocios que reciben paquetes.' },
  { nombre: 'Punto de recolección', descripcion: 'Proveedores y negocios donde se recogen envíos.' },
  { nombre: 'Servicio vehicular', descripcion: 'Talleres y estaciones de servicio para la flotilla.' },
  { nombre: 'Oficina administrativa', descripcion: 'Oficinas de atención y coordinación de la operación.' },
];

async function seedCategorias() {
  return insertarFaltantes(Categoria, CATEGORIAS_DATA);
}

if (require.main === module) {
  ejecutarSeed('categorías', seedCategorias);
}

module.exports = { CATEGORIAS_DATA, seedCategorias };
