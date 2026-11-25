"use strict";

require('dotenv').config();

const bcrypt = require('bcrypt');
const Usuario = require('../models/Usuario');
const { connectDatabase, disconnectDatabase } = require('../config/database');

const BCRYPT_SALT_ROUNDS = 10;

const ADMIN_SEED_CONFIGS = [
  {
    nombre: 'JoacoVRZ',
    envCorreo: 'SEED_ADMIN_JOACO_CORREO',
    defaultCorreo: 'joacovrz@nexlog.local',
    envPassword: 'SEED_ADMIN_JOACO_PASSWORD',
  },
  {
    nombre: 'AndresSIG',
    envCorreo: 'SEED_ADMIN_ANDRES_CORREO',
    defaultCorreo: 'andressig@nexlog.local',
    envPassword: 'SEED_ADMIN_ANDRES_PASSWORD',
  },
];

async function seedAdmins({ strict = false } = {}) {
  const results = [];

  for (const adminConfig of ADMIN_SEED_CONFIGS) {
    const correo = (process.env[adminConfig.envCorreo] || adminConfig.defaultCorreo)
      .trim()
      .toLowerCase();
    const password = process.env[adminConfig.envPassword] || process.env.SEED_ADMINS_PASSWORD;

    if (!password) {
      const message = `Seed omitido para ${adminConfig.nombre}: falta ${adminConfig.envPassword} en .env.`;
      if (strict) {
        throw new Error(message);
      }
      console.warn(message);
      results.push({ nombre: adminConfig.nombre, correo, status: 'skipped_missing_password' });
      continue;
    }

    if (password.length < 8) {
      throw new Error(`${adminConfig.envPassword} debe contener al menos 8 caracteres.`);
    }

    const existing = await Usuario.findOne({ correo });
    if (existing) {
      results.push({ nombre: adminConfig.nombre, correo, status: 'already_exists' });
      continue;
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    await Usuario.create({
      nombre: adminConfig.nombre,
      correo,
      passwordHash,
      rol: 'administrador',
      estado: 'aprobado',
    });

    console.log(`Administrador inicializado: ${adminConfig.nombre} (${correo})`);
    results.push({ nombre: adminConfig.nombre, correo, status: 'created' });
  }

  return results;
}

if (require.main === module) {
  (async () => {
    try {
      await connectDatabase();
      const summary = await seedAdmins({ strict: true });
      console.log('Resultado del seed de administradores:', summary);
    } catch (error) {
      console.error('Error ejecutando el seed de administradores:', error.message);
      process.exitCode = 1;
    } finally {
      await disconnectDatabase();
    }
  })();
}

module.exports = { ADMIN_SEED_CONFIGS, seedAdmins };
