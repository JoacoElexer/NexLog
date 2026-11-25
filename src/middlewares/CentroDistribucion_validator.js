"use strict";

const { checkObject, checkText, checkEnum, checkPoint } = require('./common_validator');

function validateCentroDistribucion(body) {
  const errors = [];
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return ['El cuerpo debe ser un objeto JSON.'];
  }
  checkText(body?.nombre, 'nombre', errors, { required: true });
  checkText(body?.gerente, 'gerente', errors, { required: true });
  if (checkObject(body, 'direccion', errors)) {
    for (const field of ['calle', 'ciudad', 'estado']) {
      checkText(body.direccion[field], `direccion.${field}`, errors, { required: true, max: 200 });
    }
  }
  checkPoint(body?.ubicacion, 'ubicacion', errors);
  if (!Number.isFinite(body?.coberturaKm) || body.coberturaKm <= 0) {
    errors.push('coberturaKm debe ser un número mayor que cero.');
  }
  checkEnum(body?.estado, 'estado', ['operativo', 'inactivo'], errors);
  return errors;
}

function validateCentroDistribucionPatch(body) {
  const errors = [];
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return ['El cuerpo debe ser un objeto JSON.'];
  }
  const fields = Object.keys(body || {});

  if (fields.length === 0) {
    errors.push('Debe enviar al menos un campo para actualizar.');
    return errors;
  }

  if ('nombre' in body) checkText(body.nombre, 'nombre', errors, { required: true });
  if ('gerente' in body) checkText(body.gerente, 'gerente', errors, { required: true });
  if ('direccion' in body && checkObject(body, 'direccion', errors)) {
    for (const field of ['calle', 'ciudad', 'estado']) {
      checkText(body.direccion[field], `direccion.${field}`, errors, { required: true, max: 200 });
    }
  }
  if ('ubicacion' in body) checkPoint(body.ubicacion, 'ubicacion', errors);
  if ('coberturaKm' in body && (!Number.isFinite(body.coberturaKm) || body.coberturaKm <= 0)) {
    errors.push('coberturaKm debe ser un número mayor que cero.');
  }
  if ('estado' in body) checkEnum(body.estado, 'estado', ['operativo', 'inactivo'], errors, true);

  return errors;
}

module.exports = { validateCentroDistribucion, validateCentroDistribucionPatch };
