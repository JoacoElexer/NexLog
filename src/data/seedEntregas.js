"use strict";

const Entrega = require('../models/Entrega');
const CentroDistribucion = require('../models/CentroDistribucion');
const ZonaReparto = require('../models/ZonaReparto');
const { CENTROS_DISTRIBUCION_DATA } = require('./seedCentrosDistribucion');
const { buildZonasRepartoData } = require('./seedZonasReparto');
const { insertarFaltantes, buscarRequeridos, ejecutarSeed } = require('./seedUtils');

const CATEGORIAS = ['Express', 'Estándar', 'Frágil', 'Documentación', 'Comercio'];
const CENTROS_LEON = 5;

const DESTINATARIOS = [
  ['Rosa Elena Gallardo', 'Calle Pino Suárez 318'],
  ['Comercializadora El Roble', 'Blvd. Morelos 2890'],
  ['Arturo Benítez Lozano', 'Calle Río Mayo 145'],
  ['Clínica Santa Fe', 'Blvd. Hilario Medina 1020'],
  ['Teresa Quiroz Medina', 'Calle Hacienda Arriba 77'],
  ['Refaccionaria Bajío', 'Blvd. Adolfo López Mateos 3400'],
  ['Gerardo Fuentes Ávila', 'Calle Jardines del Moral 210'],
  ['Boutique Alma', 'Calle Francisco I. Madero 560'],
  ['Cecilia Robles Treviño', 'Calle Prolongación Juárez 1180'],
  ['Despacho Contable Ruiz', 'Blvd. Campestre 1500'],
  ['Andrés Mejía Rosales', 'Calle Lomas del Sol 92'],
  ['Panadería La Espiga', 'Calle 20 de Enero 405'],
  ['Lucía Barrera Nava', 'Calle San Juan Bosco 640'],
  ['Óptica Visión Clara', 'Blvd. Mariano Escobedo 2210'],
  ['Raúl Espinoza Duarte', 'Calle Valle del Sol 38'],
  ['Florería Primavera', 'Calle Belisario Domínguez 815'],
  ['Hugo Treviño Salgado', 'Comunidad Duarte s/n'],
  ['Martha Olvera Ríos', 'Comunidad Los Ramírez s/n'],
];

function buildEntregasData(centrosDocs, zonasDocs) {
  return DESTINATARIOS.map(([nombre, calle], index) => {
    const num = String(index + 1).padStart(2, '0');
    const centroIndex = index % CENTROS_LEON;
    const [baseLon, baseLat] = CENTROS_DISTRIBUCION_DATA[centroIndex].ubicacion.coordinates;
    const sinCobertura = index >= 16;

    let estado = 'pendiente';
    if (!sinCobertura) {
      estado = ['en_ruta', 'asignada', 'entregada', 'asignada', 'incidencia'][index % 5];
    }

    const lonOffset = index % 2 === 0 ? 0.006 : -0.006;
    const latOffset = index % 3 === 0 ? 0.005 : -0.005;

    return {
      destinatario: { nombre, telefono: `477 555 ${String(301 + index).padStart(4, '0')}` },
      categoria: CATEGORIAS[index % CATEGORIAS.length],
      direccionDestino: { calle, ciudad: 'León', estado: 'Guanajuato' },
      destino: {
        type: 'Point',
        coordinates: sinCobertura
          ? [Number((baseLon - 0.12).toFixed(4)), Number((baseLat + 0.15).toFixed(4))]
          : [Number((baseLon + lonOffset).toFixed(4)), Number((baseLat + latOffset).toFixed(4))],
      },
      centro: sinCobertura ? null : centrosDocs[centroIndex]?.id || null,
      zona: sinCobertura ? null : zonasDocs[centroIndex]?.id || null,
      ruta: null,
      estado,
      observaciones: sinCobertura
        ? `Pedido ${num}: destino fuera de la cobertura de los centros; requiere revisión.`
        : `Pedido ${num}: entregar en horario de oficina.`,
    };
  });
}

async function seedEntregas(centrosDocs, zonasDocs) {
  const centros = centrosDocs || await buscarRequeridos(
    CentroDistribucion,
    CENTROS_DISTRIBUCION_DATA.map((c) => c.nombre),
    'nombre',
    'seed:centros',
  );
  const zonas = zonasDocs || await buscarRequeridos(
    ZonaReparto,
    buildZonasRepartoData([]).map((z) => z.nombre),
    'nombre',
    'seed:zonas',
  );
  return insertarFaltantes(Entrega, buildEntregasData(centros, zonas), 'destinatario.nombre');
}

if (require.main === module) {
  ejecutarSeed('entregas', () => seedEntregas());
}

module.exports = { buildEntregasData, seedEntregas };
