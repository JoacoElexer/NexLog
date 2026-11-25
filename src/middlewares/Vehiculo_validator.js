"use strict";

const { isPlainObject, checkPatchBody, checkText, checkEnum } = require('./common_validator');

const TIPOS_VEHICULO = ['camion', 'camioneta'];
const MARCAS_VEHICULO = ['Ford', 'Toyota', 'Chevrolet'];
const ESTADOS_VEHICULO = ['disponible', 'asignado', 'mantenimiento', 'inactivo'];

function validateVehiculo(body) {
  if (!isPlainObject(body)) {
    return ['El cuerpo debe ser un objeto JSON.'];
  }
  const errors = [];
  checkText(body.placa, 'placa', errors, { required: true, max: 20 });
  checkEnum(body.tipo, 'tipo', TIPOS_VEHICULO, errors, true);
  checkEnum(body.marca, 'marca', MARCAS_VEHICULO, errors, true);
  checkText(body.modelo, 'modelo', errors, { required: true, max: 60 });
  checkEnum(body.estado, 'estado', ESTADOS_VEHICULO, errors);
  return errors;
}

function validateVehiculoPatch(body) {
  const bodyErrors = checkPatchBody(body);
  if (bodyErrors) return bodyErrors;

  const errors = [];
  if ('placa' in body) checkText(body.placa, 'placa', errors, { required: true, max: 20 });
  if ('tipo' in body) checkEnum(body.tipo, 'tipo', TIPOS_VEHICULO, errors, true);
  if ('marca' in body) checkEnum(body.marca, 'marca', MARCAS_VEHICULO, errors, true);
  if ('modelo' in body) checkText(body.modelo, 'modelo', errors, { required: true, max: 60 });
  if ('estado' in body) checkEnum(body.estado, 'estado', ESTADOS_VEHICULO, errors, true);
  return errors;
}

module.exports = { validateVehiculo, validateVehiculoPatch };
