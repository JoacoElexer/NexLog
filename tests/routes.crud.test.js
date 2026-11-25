"use strict";

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const Usuario = require('../src/models/Usuario');
const CentroDistribucion = require('../src/models/CentroDistribucion');
const Repartidor = require('../src/models/Repartidor');
const Vehiculo = require('../src/models/Vehiculo');
const { startTestServer } = require('./helpers/testServer');

const VALID_ID = '507f1f77bcf86cd799439011';

describe('Rutas CRUD HTTP, códigos de estado y manejo centralizado de errores', () => {
  let client;
  let authHeader;
  const originals = {
    userFindById: Usuario.findById,
    centroFind: CentroDistribucion.find,
    centroFindById: CentroDistribucion.findById,
    centroCreate: CentroDistribucion.create,
    centroUpdate: CentroDistribucion.findByIdAndUpdate,
    centroDelete: CentroDistribucion.findByIdAndDelete,
    repFind: Repartidor.find,
    repCreate: Repartidor.create,
    vehFind: Vehiculo.find,
  };

  before(async () => {
    client = await startTestServer();
    Usuario.findById = async () => ({
      _id: VALID_ID,
      id: VALID_ID,
      nombre: 'Admin Test',
      correo: 'admin@nexlog.local',
      rol: 'administrador',
      estado: 'aprobado',
    });

    const token = jwt.sign({ sub: VALID_ID, rol: 'administrador' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    authHeader = { Authorization: `Bearer ${token}` };
  });

  after(async () => {
    Usuario.findById = originals.userFindById;
    CentroDistribucion.find = originals.centroFind;
    CentroDistribucion.findById = originals.centroFindById;
    CentroDistribucion.create = originals.centroCreate;
    CentroDistribucion.findByIdAndUpdate = originals.centroUpdate;
    CentroDistribucion.findByIdAndDelete = originals.centroDelete;
    Repartidor.find = originals.repFind;
    Repartidor.create = originals.repCreate;
    Vehiculo.find = originals.vehFind;
    await client.close();
  });

  it('Rutas públicas / y /api/health responden 200 y rutas inexistentes devuelven 404', async () => {
    const rootRes = await client.request('/');
    assert.equal(rootRes.status, 200);
    assert.equal(rootRes.body.endpoints.health, '/api/health');

    const healthRes = await client.request('/api/health');
    assert.equal(healthRes.status, 200);
    assert.deepStrictEqual(healthRes.body, { status: 'ok' });

    const notFoundRes = await client.request('/api/ruta-que-no-existe');
    assert.equal(notFoundRes.status, 404);
    assert.equal(typeof notFoundRes.body.error, 'string');
  });

  it('Valida ObjectId (400), cuerpo inválido (400) y recurso no encontrado (404) en /api/centros-distribucion', async () => {
    const badIdRes = await client.request('/api/centros-distribucion/id-invalido', {
      headers: authHeader,
    });
    assert.equal(badIdRes.status, 400);

    const badPostRes = await client.request('/api/centros-distribucion', {
      method: 'POST',
      headers: authHeader,
      body: { nombre: 'Incompleto' },
    });
    assert.equal(badPostRes.status, 400);

    const badPatchRes = await client.request(`/api/centros-distribucion/${VALID_ID}`, {
      method: 'PATCH',
      headers: authHeader,
      body: {},
    });
    assert.equal(badPatchRes.status, 400);

    CentroDistribucion.findById = async () => null;
    const notFoundRes = await client.request(`/api/centros-distribucion/${VALID_ID}`, {
      headers: authHeader,
    });
    assert.equal(notFoundRes.status, 404);
  });

  it('Ejecuta CRUD completo en /api/centros-distribucion y consulta /geojson', async () => {
    const sampleCentro = {
      _id: new mongoose.Types.ObjectId(VALID_ID),
      nombre: 'Centro Prueba HTTP',
      gerente: 'Gerente HTTP',
      direccion: { calle: 'Calle 1', ciudad: 'Ciudad Demo', estado: 'Estado Demo' },
      ubicacion: { type: 'Point', coordinates: [-100.4, 20.5] },
      coberturaKm: 20,
      estado: 'operativo',
    };

    CentroDistribucion.find = () => ({
      sort: async () => [sampleCentro],
      select: async () => [sampleCentro],
    });
    CentroDistribucion.create = async (data) => ({ _id: VALID_ID, ...data });
    CentroDistribucion.findByIdAndUpdate = async (_id, data) => ({ ...sampleCentro, ...data });
    CentroDistribucion.findByIdAndDelete = async () => sampleCentro;

    const listRes = await client.request('/api/centros-distribucion', { headers: authHeader });
    assert.equal(listRes.status, 200);
    assert.equal(listRes.body.length, 1);

    const geoRes = await client.request('/api/centros-distribucion/geojson', { headers: authHeader });
    assert.equal(geoRes.status, 200);
    assert.equal(geoRes.body[0].ubicacion.type, 'Point');

    const createRes = await client.request('/api/centros-distribucion', {
      method: 'POST',
      headers: authHeader,
      body: {
        nombre: sampleCentro.nombre,
        gerente: sampleCentro.gerente,
        direccion: sampleCentro.direccion,
        ubicacion: sampleCentro.ubicacion,
        coberturaKm: sampleCentro.coberturaKm,
      },
    });
    assert.equal(createRes.status, 201);

    const patchRes = await client.request(`/api/centros-distribucion/${VALID_ID}`, {
      method: 'PATCH',
      headers: authHeader,
      body: { estado: 'inactivo' },
    });
    assert.equal(patchRes.status, 200);
    assert.equal(patchRes.body.estado, 'inactivo');

    const deleteRes = await client.request(`/api/centros-distribucion/${VALID_ID}`, {
      method: 'DELETE',
      headers: authHeader,
    });
    assert.equal(deleteRes.status, 204);
  });

  it('Repartidores y vehículos responden con los códigos HTTP esperados tras autenticar', async () => {
    Repartidor.find = () => ({ sort: async () => [] });
    Repartidor.create = async (data) => ({ _id: VALID_ID, estado: 'disponible', ...data });
    Vehiculo.find = () => ({ sort: async () => [] });

    const repList = await client.request('/api/repartidores', { headers: authHeader });
    assert.equal(repList.status, 200);

    const repPost = await client.request('/api/repartidores', {
      method: 'POST',
      headers: authHeader,
      body: { nombre: 'Repartidor HTTP', telefono: '5550001111' },
    });
    assert.equal(repPost.status, 201);

    const vehList = await client.request('/api/vehiculos', { headers: authHeader });
    assert.equal(vehList.status, 200);
  });
});
