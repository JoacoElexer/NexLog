"use strict";

require('dotenv').config();

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');

const { connectDatabase, disconnectDatabase } = require('../src/config/database');
const { seedAdmins } = require('../src/data/seedAdmins');
const { startLiveTestServer } = require('./helpers/testServer');

describe('Prueba en vivo contra MongoDB Atlas: login de administradores seed', () => {
  let client;

  before(async () => {
    assert.ok(process.env.MONGO_URI, 'Falta MONGO_URI en .env para ejecutar la prueba en vivo.');
    assert.ok(process.env.JWT_SECRET, 'Falta JWT_SECRET en .env para ejecutar la prueba en vivo.');
    await connectDatabase();
    await seedAdmins({ strict: false });
    client = await startLiveTestServer();
  });

  after(async () => {
    if (client) await client.close();
    await disconnectDatabase();
  });

  it('Permite iniciar sesión y consultar /api/auth/me a los administradores configurados en .env', async () => {
    const admins = [
      {
        nombre: 'JoacoVRZ',
        correo: (process.env.SEED_ADMIN_JOACO_CORREO || 'joacovrz@nexlog.local').trim().toLowerCase(),
        password: process.env.SEED_ADMIN_JOACO_PASSWORD || process.env.SEED_ADMINS_PASSWORD,
      },
      {
        nombre: 'AndresSIG',
        correo: (process.env.SEED_ADMIN_ANDRES_CORREO || 'andressig@nexlog.local').trim().toLowerCase(),
        password: process.env.SEED_ADMIN_ANDRES_PASSWORD || process.env.SEED_ADMINS_PASSWORD,
      },
    ];

    for (const admin of admins) {
      assert.ok(admin.password, `Configura la contraseña en .env para probar login en vivo de ${admin.nombre}.`);

      const loginRes = await client.request('/api/auth/login', {
        method: 'POST',
        body: { correo: admin.correo, password: admin.password },
      });
      assert.equal(loginRes.status, 200, `Login falló para ${admin.nombre}: ${JSON.stringify(loginRes.body)}`);
      assert.equal(typeof loginRes.body.token, 'string');
      assert.equal(loginRes.body.usuario.rol, 'administrador');
      assert.equal('passwordHash' in loginRes.body.usuario, false);

      const meRes = await client.request('/api/auth/me', {
        headers: { Authorization: `Bearer ${loginRes.body.token}` },
      });
      assert.equal(meRes.status, 200);
      assert.equal(meRes.body.correo, admin.correo);
    }
  });
});
