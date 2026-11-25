"use strict";

const CentroDistribucion = require('../models/CentroDistribucion');
const { insertarFaltantes, ejecutarSeed } = require('./seedUtils');

function centro(nombre, gerente, calle, ciudad, lat, lon, coberturaKm, estado = 'operativo') {
  return {
    nombre,
    gerente,
    direccion: { calle, ciudad, estado: 'Guanajuato' },
    ubicacion: { type: 'Point', coordinates: [lon, lat] },
    coberturaKm,
    estado,
  };
}

// Los cinco primeros son los centros de León; el resto cubre otras ciudades del Bajío.
const CENTROS_DISTRIBUCION_DATA = [
  centro('CEDIS León Centro', 'Laura Méndez Ortega', 'Calle Madero 412, Zona Centro', 'León', 21.1225, -101.6800, 6),
  centro('CEDIS León Norte', 'Roberto Salinas Prieto', 'Blvd. Morelos 2150', 'León', 21.1600, -101.6750, 8),
  centro('CEDIS León Sur', 'Patricia Rangel Soto', 'Blvd. Aeropuerto 1800', 'León', 21.0800, -101.6550, 8),
  centro('CEDIS León Oriente', 'Héctor Villalobos Cano', 'Blvd. Timoteo Lozano 3300', 'León', 21.1150, -101.6150, 7),
  centro('CEDIS León Poniente', 'Gabriela Torres Medina', 'Blvd. Juan Alonso de Torres 4100', 'León', 21.1300, -101.7400, 7),
  centro('CEDIS Silao Puerto Interior', 'Fernando Ibarra Luna', 'Av. Mineral de Valenciana 210', 'Silao', 20.9700, -101.4050, 15),
  centro('CEDIS Irapuato Norte', 'Claudia Ríos Herrera', 'Blvd. Díaz Ordaz 1500', 'Irapuato', 20.6950, -101.3500, 10),
  centro('CEDIS Irapuato Sur', 'Martín Cervantes Gil', 'Av. Guerrero 900', 'Irapuato', 20.6550, -101.3600, 10),
  centro('CEDIS Celaya Oriente', 'Adriana Paredes Vega', 'Av. 2 de Abril 1100', 'Celaya', 20.5250, -100.7900, 10),
  centro('CEDIS Celaya Poniente', 'Óscar Núñez Fajardo', 'Blvd. López Mateos 2400', 'Celaya', 20.5220, -100.8400, 10),
  centro('CEDIS Salamanca', 'Verónica Lara Delgado', 'Blvd. Faja de Oro 700', 'Salamanca', 20.5730, -101.1950, 12),
  centro('CEDIS Guanajuato Capital', 'Javier Estrada Ponce', 'Carretera Guanajuato-Juventino Rosas km 3', 'Guanajuato', 21.0190, -101.2570, 10),
  centro('CEDIS San Francisco del Rincón', 'Mónica Aguirre Bravo', 'Av. Guanajuato 520', 'San Francisco del Rincón', 21.0180, -101.8560, 9),
  centro('CEDIS Romita', 'Ernesto Valdez Rocha', 'Calle Hidalgo 135', 'Romita', 20.8710, -101.5170, 8, 'inactivo'),
  centro('CEDIS Dolores Hidalgo', 'Silvia Cárdenas Montes', 'Blvd. Dolores-San Miguel 300', 'Dolores Hidalgo', 21.1570, -100.9340, 9),
];

async function seedCentrosDistribucion() {
  return insertarFaltantes(CentroDistribucion, CENTROS_DISTRIBUCION_DATA);
}

if (require.main === module) {
  ejecutarSeed('centros de distribución', seedCentrosDistribucion);
}

module.exports = { CENTROS_DISTRIBUCION_DATA, seedCentrosDistribucion };
