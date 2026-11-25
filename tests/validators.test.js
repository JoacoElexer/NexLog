"use strict";

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');

const { validateCentroDistribucion, validateCentroDistribucionPatch } = require('../src/middlewares/CentroDistribucion_validator');
const { validateEntrega, validateEntregaPatch } = require('../src/middlewares/Entrega_validator');
const { validateRepartidor, validateRepartidorPatch } = require('../src/middlewares/Repartidor_validator');
const { validateRuta, validateRutaPatch } = require('../src/middlewares/Ruta_validator');
const { validateVehiculo, validateVehiculoPatch } = require('../src/middlewares/Vehiculo_validator');
const { validateZonaReparto, validateZonaRepartoPatch } = require('../src/middlewares/ZonaReparto_validator');
const { validateRegistroUsuario, validateUsuarioPatch, validateLogin } = require('../src/middlewares/Usuario_validator');

const { CENTROS_DISTRIBUCION_DATA } = require('../src/data/seedCentrosDistribucion');
const { buildZonasRepartoData } = require('../src/data/seedZonasReparto');
const { REPARTIDORES_DATA } = require('../src/data/seedRepartidores');
const { VEHICULOS_DATA } = require('../src/data/seedVehiculos');
const { buildEntregasData } = require('../src/data/seedEntregas');
const { buildRutasData } = require('../src/data/seedRutas');

const OID_1 = '507f1f77bcf86cd799439011';
const OID_2 = '507f1f77bcf86cd799439012';

describe('Validadores de entidades, GeoJSON y payloads seed', () => {
  it('Todos los validadores Patch rechazan cuerpos vacíos o no objetos', () => {
    const patchValidators = [
      validateCentroDistribucionPatch,
      validateEntregaPatch,
      validateRepartidorPatch,
      validateRutaPatch,
      validateVehiculoPatch,
      validateZonaRepartoPatch,
      validateUsuarioPatch,
    ];

    for (const validator of patchValidators) {
      assert(validator(null).length > 0);
      assert(validator([]).length > 0);
      assert(validator({}).length > 0);
    }
  });

  it('Valida creación y actualización parcial de Centros, Zonas, Entregas, Rutas, Repartidores, Vehículos y Usuarios', () => {
    assert.deepStrictEqual(validateCentroDistribucionPatch({ estado: 'inactivo' }), []);
    assert(validateCentroDistribucionPatch({ coberturaKm: -5 }).length > 0);

    assert.deepStrictEqual(validateEntregaPatch({ estado: 'en_ruta' }), []);
    assert(validateEntregaPatch({ destino: { type: 'Point', coordinates: [190, 20] } }).length > 0);

    assert.deepStrictEqual(validateZonaRepartoPatch({ estado: 'inactiva' }), []);
    assert(
      validateZonaRepartoPatch({
        geometria: {
          type: 'Polygon',
          coordinates: [[[-100.4, 20.5], [-100.3, 20.5], [-100.3, 20.6], [-100.2, 20.7]]],
        },
      }).length > 0,
    );

    assert.deepStrictEqual(validateRutaPatch({ estado: 'en_curso', vehiculo: null }), []);
    assert(
      validateRutaPatch({
        paradas: [
          { entrega: OID_1, orden: 1 },
          { entrega: OID_2, orden: 1 },
        ],
      }).length > 0,
    );

    assert.deepStrictEqual(validateRepartidor({ nombre: 'Luis Prueba', telefono: '5551234567' }), []);
    assert.deepStrictEqual(validateRepartidorPatch({ estado: 'asignado' }), []);
    assert(validateRepartidorPatch({ telefono: '' }).length > 0);

    assert.deepStrictEqual(validateVehiculo({ placa: 'DEM-999', tipo: 'camion', marca: 'Ford', modelo: 'F-350' }), []);
    assert.deepStrictEqual(validateVehiculoPatch({ estado: 'mantenimiento' }), []);
    assert(validateVehiculoPatch({ marca: 'Otra' }).length > 0);

    assert.deepStrictEqual(validateRegistroUsuario({ nombre: 'Ana Demo', correo: 'ana@nexlog.local', password: 'Password123' }), []);
    assert(validateRegistroUsuario({ nombre: 'Ana Demo', correo: 'ana@nexlog.local', password: 'Password123', estado: 'aprobado' }).length > 0);
    assert.deepStrictEqual(validateUsuarioPatch({ estado: 'aprobado', rol: 'operador' }), []);
    assert(validateUsuarioPatch({ passwordHash: 'secreto' }).length > 0);
    assert.deepStrictEqual(validateLogin({ correo: 'ana@nexlog.local', password: 'Password123' }), []);
    assert(validateLogin({ correo: 'ana', password: '' }).length >= 2);
  });

  it('Todos los datasets seed en src/data/ tienen al menos 15 registros y pasan sus validadores', () => {
    const withIds = (items) =>
      items.map((item) => {
        const oid = new mongoose.Types.ObjectId();
        return { ...item, _id: oid, id: oid.toHexString() };
      });

    const centros = withIds(CENTROS_DISTRIBUCION_DATA);
    const zonasData = buildZonasRepartoData(centros);
    const zonas = withIds(zonasData);
    const repartidores = withIds(REPARTIDORES_DATA);
    const vehiculos = withIds(VEHICULOS_DATA);
    const entregasData = buildEntregasData(centros, zonas);
    const entregas = withIds(entregasData);
    const rutasData = buildRutasData(centros, repartidores, vehiculos, entregas);

    assert(CENTROS_DISTRIBUCION_DATA.length >= 15);
    assert(zonasData.length >= 15);
    assert(REPARTIDORES_DATA.length >= 15);
    assert(VEHICULOS_DATA.length >= 15);
    assert(entregasData.length >= 15);
    assert(rutasData.length >= 15);

    for (const item of CENTROS_DISTRIBUCION_DATA) assert.deepStrictEqual(validateCentroDistribucion(item), []);
    for (const item of zonasData) assert.deepStrictEqual(validateZonaReparto(item), []);
    for (const item of REPARTIDORES_DATA) assert.deepStrictEqual(validateRepartidor(item), []);
    for (const item of VEHICULOS_DATA) assert.deepStrictEqual(validateVehiculo(item), []);
    for (const item of entregasData) assert.deepStrictEqual(validateEntrega(item), []);
    for (const item of rutasData) assert.deepStrictEqual(validateRuta(item), []);
  });
});
