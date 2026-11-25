"use strict";

const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const Usuario = require('../src/models/Usuario');
const CentroDistribucion = require('../src/models/CentroDistribucion');
const { seedAdmins } = require('../src/data/seedAdmins');
const { startTestServer } = require('./helpers/testServer');

function createUsuarioStore() {
  const users = [];

  function cloneUser(doc, includePasswordHash = false) {
    const copy = {
      _id: doc._id,
      id: doc.id,
      nombre: doc.nombre,
      correo: doc.correo,
      rol: doc.rol,
      estado: doc.estado,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
    if (includePasswordHash) {
      copy.passwordHash = doc.passwordHash;
    }
    return copy;
  }

  function makeQuery(singleResolver) {
    let includeHash = false;
    const query = {
      select(fields) {
        if (typeof fields === 'string' && fields.includes('+passwordHash')) {
          includeHash = true;
        }
        return query;
      },
      sort() {
        return query;
      },
      then(resolve, reject) {
        return Promise.resolve(singleResolver(includeHash)).then(resolve, reject);
      },
    };
    return query;
  }

  return {
    users,
    reset() {
      users.length = 0;
    },
    find(filter = {}) {
      return makeQuery((includeHash) =>
        users
          .filter((u) => Object.entries(filter).every(([k, v]) => u[k] === v))
          .sort((a, b) => a.nombre.localeCompare(b.nombre))
          .map((u) => cloneUser(u, includeHash)),
      );
    },
    findOne(filter = {}) {
      return makeQuery((includeHash) => {
        const found = users.find((u) => Object.entries(filter).every(([k, v]) => u[k] === v));
        return found ? cloneUser(found, includeHash) : null;
      });
    },
    findById(id) {
      return makeQuery((includeHash) => {
        const found = users.find((u) => u.id === String(id));
        return found ? cloneUser(found, includeHash) : null;
      });
    },
    async create(data) {
      const oid = new mongoose.Types.ObjectId();
      const now = new Date();
      const saved = {
        _id: oid,
        id: oid.toHexString(),
        nombre: data.nombre,
        correo: String(data.correo).trim().toLowerCase(),
        passwordHash: data.passwordHash,
        rol: data.rol || 'operador',
        estado: data.estado || 'pendiente',
        createdAt: now,
        updatedAt: now,
      };
      users.push(saved);
      return cloneUser(saved, true);
    },
    async findByIdAndUpdate(id, payload) {
      const found = users.find((u) => u.id === String(id));
      if (!found) return null;
      Object.assign(found, payload, { updatedAt: new Date() });
      return cloneUser(found, false);
    },
    async findByIdAndDelete(id) {
      const idx = users.findIndex((u) => u.id === String(id));
      if (idx === -1) return null;
      const [removed] = users.splice(idx, 1);
      return cloneUser(removed, false);
    },
  };
}

describe('Autenticación JWT, autorización y seed de administradores', () => {
  let client;
  const store = createUsuarioStore();
  const originals = {
    find: Usuario.find,
    findOne: Usuario.findOne,
    findById: Usuario.findById,
    create: Usuario.create,
    findByIdAndUpdate: Usuario.findByIdAndUpdate,
    findByIdAndDelete: Usuario.findByIdAndDelete,
    centroFind: CentroDistribucion.find,
  };

  before(async () => {
    client = await startTestServer();
    Usuario.find = (f) => store.find(f);
    Usuario.findOne = (f) => store.findOne(f);
    Usuario.findById = (id) => store.findById(id);
    Usuario.create = (d) => store.create(d);
    Usuario.findByIdAndUpdate = (id, p) => store.findByIdAndUpdate(id, p);
    Usuario.findByIdAndDelete = (id) => store.findByIdAndDelete(id);
    CentroDistribucion.find = () => ({ sort: async () => [] });
  });

  after(async () => {
    Usuario.find = originals.find;
    Usuario.findOne = originals.findOne;
    Usuario.findById = originals.findById;
    Usuario.create = originals.create;
    Usuario.findByIdAndUpdate = originals.findByIdAndUpdate;
    Usuario.findByIdAndDelete = originals.findByIdAndDelete;
    CentroDistribucion.find = originals.centroFind;
    await client.close();
  });

  beforeEach(() => {
    store.reset();
  });

  it('POST /api/auth/register valida campos, cifra con bcrypt y deja la cuenta pendiente sin emitir token', async () => {
    const badRes = await client.request('/api/auth/register', {
      method: 'POST',
      body: { nombre: 'A', correo: 'no-valido', password: '123', rol: 'administrador' },
    });
    assert.equal(badRes.status, 400);

    const okRes = await client.request('/api/auth/register', {
      method: 'POST',
      body: { nombre: 'Operador Demo', correo: 'Operador@NexLog.Local', password: 'Password123' },
    });
    assert.equal(okRes.status, 201);
    assert.equal(okRes.body.usuario.rol, 'operador');
    assert.equal(okRes.body.usuario.estado, 'pendiente');
    assert.equal(okRes.body.usuario.correo, 'operador@nexlog.local');
    assert.equal('passwordHash' in okRes.body.usuario, false);
    assert.equal('token' in okRes.body, false);

    const stored = store.users[0];
    assert.notEqual(stored.passwordHash, 'Password123');
    assert.equal(await bcrypt.compare('Password123', stored.passwordHash), true);

    const dupRes = await client.request('/api/auth/register', {
      method: 'POST',
      body: { nombre: 'Otro', correo: 'operador@nexlog.local', password: 'Password123' },
    });
    assert.equal(dupRes.status, 400);
  });

  it('POST /api/auth/login rechaza credenciales inválidas y cuentas pendientes o rechazadas', async () => {
    const passwordHash = await bcrypt.hash('ClaveSegura123', 4);
    await store.create({
      nombre: 'Cuenta Pendiente',
      correo: 'pendiente@nexlog.local',
      passwordHash,
      rol: 'operador',
      estado: 'pendiente',
    });
    await store.create({
      nombre: 'Cuenta Rechazada',
      correo: 'rechazada@nexlog.local',
      passwordHash,
      rol: 'operador',
      estado: 'rechazado',
    });

    const missingBody = await client.request('/api/auth/login', {
      method: 'POST',
      body: { correo: 'invalido', password: '' },
    });
    assert.equal(missingBody.status, 400);

    const notFound = await client.request('/api/auth/login', {
      method: 'POST',
      body: { correo: 'noexiste@nexlog.local', password: 'ClaveSegura123' },
    });
    assert.equal(notFound.status, 401);

    const wrongPass = await client.request('/api/auth/login', {
      method: 'POST',
      body: { correo: 'pendiente@nexlog.local', password: 'incorrecta' },
    });
    assert.equal(wrongPass.status, 401);

    const pendingLogin = await client.request('/api/auth/login', {
      method: 'POST',
      body: { correo: 'pendiente@nexlog.local', password: 'ClaveSegura123' },
    });
    assert.equal(pendingLogin.status, 403);

    const rejectedLogin = await client.request('/api/auth/login', {
      method: 'POST',
      body: { correo: 'rechazada@nexlog.local', password: 'ClaveSegura123' },
    });
    assert.equal(rejectedLogin.status, 403);
  });

  it('Flujo completo: registro pendiente -> aprobación por admin -> login JWT -> acceso a /me y rutas protegidas', async () => {
    const adminHash = await bcrypt.hash('AdminPass123', 4);
    await store.create({
      nombre: 'JoacoVRZ',
      correo: 'joacovrz@nexlog.local',
      passwordHash: adminHash,
      rol: 'administrador',
      estado: 'aprobado',
    });

    // 1. Operador se registra y queda pendiente
    const regRes = await client.request('/api/auth/register', {
      method: 'POST',
      body: { nombre: 'Operador Uno', correo: 'op1@nexlog.local', password: 'OperadorPass123' },
    });
    assert.equal(regRes.status, 201);
    const operadorId = regRes.body.usuario._id;

    // 2. Admin inicia sesión (con mayúsculas y espacios para probar normalización)
    const adminLogin = await client.request('/api/auth/login', {
      method: 'POST',
      body: { correo: '  JoacoVRZ@NexLog.LOCAL ', password: 'AdminPass123' },
    });
    assert.equal(adminLogin.status, 200);
    assert.equal(typeof adminLogin.body.token, 'string');
    assert.equal(adminLogin.body.usuario.rol, 'administrador');
    assert.equal('passwordHash' in adminLogin.body.usuario, false);

    const decoded = jwt.verify(adminLogin.body.token, process.env.JWT_SECRET);
    assert.equal(decoded.rol, 'administrador');

    // 3. Admin consulta /api/auth/me y aprueba al operador en /api/usuarios/:id
    const meRes = await client.request('/api/auth/me', {
      headers: { Authorization: `Bearer ${adminLogin.body.token}` },
    });
    assert.equal(meRes.status, 200);
    assert.equal(meRes.body.nombre, 'JoacoVRZ');

    const approveRes = await client.request(`/api/usuarios/${operadorId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminLogin.body.token}` },
      body: { estado: 'aprobado' },
    });
    assert.equal(approveRes.status, 200);
    assert.equal(approveRes.body.estado, 'aprobado');

    // 4. Operador aprobado ya puede iniciar sesión
    const opLogin = await client.request('/api/auth/login', {
      method: 'POST',
      body: { correo: 'op1@nexlog.local', password: 'OperadorPass123' },
    });
    assert.equal(opLogin.status, 200);
    assert.equal(opLogin.body.usuario.rol, 'operador');

    // 5. Operador puede consultar rutas operativas, pero NO /api/usuarios
    const opCentros = await client.request('/api/centros-distribucion', {
      headers: { Authorization: `Bearer ${opLogin.body.token}` },
    });
    assert.equal(opCentros.status, 200);

    const opUsuarios = await client.request('/api/usuarios', {
      headers: { Authorization: `Bearer ${opLogin.body.token}` },
    });
    assert.equal(opUsuarios.status, 403);
  });

  it('Middleware authenticate rechaza peticiones sin token, token inválido o cuenta ya no aprobada', async () => {
    const noAuth = await client.request('/api/auth/me');
    assert.equal(noAuth.status, 401);

    const badToken = await client.request('/api/centros-distribucion', {
      headers: { Authorization: 'Bearer token.falso.123' },
    });
    assert.equal(badToken.status, 401);

    const hash = await bcrypt.hash('UserPass123', 4);
    const user = await store.create({
      nombre: 'Temporal',
      correo: 'temp@nexlog.local',
      passwordHash: hash,
      rol: 'operador',
      estado: 'aprobado',
    });

    const loginRes = await client.request('/api/auth/login', {
      method: 'POST',
      body: { correo: 'temp@nexlog.local', password: 'UserPass123' },
    });
    assert.equal(loginRes.status, 200);

    // Simular revocación cambiando estado a rechazado
    await store.findByIdAndUpdate(user.id, { estado: 'rechazado' });
    const blockedRes = await client.request('/api/auth/me', {
      headers: { Authorization: `Bearer ${loginRes.body.token}` },
    });
    assert.equal(blockedRes.status, 403);
  });

  it('seedAdmins crea a JoacoVRZ y AndresSIG de forma idempotente y ambos pueden hacer login', async () => {
    const prevJoaco = process.env.SEED_ADMIN_JOACO_PASSWORD;
    const prevAndres = process.env.SEED_ADMIN_ANDRES_PASSWORD;
    const prevShared = process.env.SEED_ADMINS_PASSWORD;

    try {
      delete process.env.SEED_ADMIN_JOACO_PASSWORD;
      delete process.env.SEED_ADMIN_ANDRES_PASSWORD;
      delete process.env.SEED_ADMINS_PASSWORD;

      await assert.rejects(() => seedAdmins({ strict: true }), /SEED_ADMIN_JOACO_PASSWORD/);

      process.env.SEED_ADMIN_JOACO_PASSWORD = 'JoacoDemoPass123!';
      process.env.SEED_ADMIN_ANDRES_PASSWORD = 'AndresDemoPass123!';

      const firstRun = await seedAdmins({ strict: true });
      assert.equal(firstRun.filter((r) => r.status === 'created').length, 2);

      const secondRun = await seedAdmins({ strict: true });
      assert.equal(secondRun.filter((r) => r.status === 'already_exists').length, 2);

      const joacoLogin = await client.request('/api/auth/login', {
        method: 'POST',
        body: { correo: 'joacovrz@nexlog.local', password: 'JoacoDemoPass123!' },
      });
      assert.equal(joacoLogin.status, 200);
      assert.equal(joacoLogin.body.usuario.nombre, 'JoacoVRZ');
      assert.equal(joacoLogin.body.usuario.rol, 'administrador');

      const andresLogin = await client.request('/api/auth/login', {
        method: 'POST',
        body: { correo: 'andressig@nexlog.local', password: 'AndresDemoPass123!' },
      });
      assert.equal(andresLogin.status, 200);
      assert.equal(andresLogin.body.usuario.nombre, 'AndresSIG');
      assert.equal(andresLogin.body.usuario.rol, 'administrador');
    } finally {
      if (prevJoaco === undefined) delete process.env.SEED_ADMIN_JOACO_PASSWORD;
      else process.env.SEED_ADMIN_JOACO_PASSWORD = prevJoaco;

      if (prevAndres === undefined) delete process.env.SEED_ADMIN_ANDRES_PASSWORD;
      else process.env.SEED_ADMIN_ANDRES_PASSWORD = prevAndres;

      if (prevShared === undefined) delete process.env.SEED_ADMINS_PASSWORD;
      else process.env.SEED_ADMINS_PASSWORD = prevShared;
    }
  });
});
