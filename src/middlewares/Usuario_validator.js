"use strict";

const { isPlainObject, checkPatchBody, checkText, checkEnum } = require('./common_validator');

const ROLES_USUARIO = ['administrador', 'operador'];
const ESTADOS_USUARIO = ['pendiente', 'aprobado', 'rechazado'];

function checkCorreo(email, errors) {
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.push('correo debe ser una dirección de correo válida.');
  }
}

function checkPassword(password, errors) {
  if (typeof password !== 'string' || password.length < 8) {
    errors.push('password debe contener al menos 8 caracteres.');
  }
}

function validateRegistroUsuario(body) {
  if (!isPlainObject(body)) {
    return ['El cuerpo debe ser un objeto JSON.'];
  }
  const errors = [];
  checkText(body.nombre, 'nombre', errors, { required: true });
  checkCorreo(body.correo, errors);
  checkPassword(body.password, errors);
  const hasOwn = (field) => Object.prototype.hasOwnProperty.call(body, field);
  if (hasOwn('passwordHash') || hasOwn('rol') || hasOwn('estado')) {
    errors.push('El registro público no puede definir passwordHash, rol ni estado.');
  }
  return errors;
}

function validateUsuarioPatch(body) {
  const bodyErrors = checkPatchBody(body);
  if (bodyErrors) return bodyErrors;

  const errors = [];
  if ('passwordHash' in body) {
    errors.push('No se permite enviar passwordHash directamente.');
  }
  if ('nombre' in body) checkText(body.nombre, 'nombre', errors, { required: true });
  if ('correo' in body) checkCorreo(body.correo, errors);
  if ('password' in body) checkPassword(body.password, errors);
  if ('rol' in body) checkEnum(body.rol, 'rol', ROLES_USUARIO, errors, true);
  if ('estado' in body) checkEnum(body.estado, 'estado', ESTADOS_USUARIO, errors, true);
  return errors;
}

function validateLogin(body) {
  if (!isPlainObject(body)) {
    return ['El cuerpo debe ser un objeto JSON.'];
  }
  const errors = [];
  checkCorreo(body.correo, errors);
  if (typeof body.password !== 'string' || body.password.length === 0) {
    errors.push('password es obligatorio.');
  }
  return errors;
}

module.exports = { validateRegistroUsuario, validateUsuarioPatch, validateLogin };
