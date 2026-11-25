"use strict";

const { isPlainObject, checkPatchBody, checkText, checkEnum } = require('./common_validator');

const ESTADOS_REPARTIDOR = ['disponible', 'asignado', 'inactivo'];

function validateRepartidor(body) {
  if (!isPlainObject(body)) {
    return ['El cuerpo debe ser un objeto JSON.'];
  }
  const errors = [];
  checkText(body.nombre, 'nombre', errors, { required: true });
  checkText(body.telefono, 'telefono', errors, { required: true, max: 30 });
  checkEnum(body.estado, 'estado', ESTADOS_REPARTIDOR, errors);
  return errors;
}

function validateRepartidorPatch(body) {
  const bodyErrors = checkPatchBody(body);
  if (bodyErrors) return bodyErrors;

  const errors = [];
  if ('nombre' in body) checkText(body.nombre, 'nombre', errors, { required: true });
  if ('telefono' in body) checkText(body.telefono, 'telefono', errors, { required: true, max: 30 });
  if ('estado' in body) checkEnum(body.estado, 'estado', ESTADOS_REPARTIDOR, errors, true);
  return errors;
}

module.exports = { validateRepartidor, validateRepartidorPatch };
