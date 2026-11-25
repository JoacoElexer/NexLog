"use strict";

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function checkPatchBody(body) {
  if (!isPlainObject(body)) {
    return ['El cuerpo debe ser un objeto JSON.'];
  }
  if (Object.keys(body).length === 0) {
    return ['Debe enviar al menos un campo para actualizar.'];
  }
  return null;
}

function checkObject(body, field, errors) {
  if (!isPlainObject(body)) {
    errors.push('El cuerpo debe ser un objeto JSON.');
    return false;
  }
  if (!isPlainObject(body[field])) {
    errors.push(`${field} debe ser un objeto.`);
    return false;
  }
  return true;
}

function checkText(value, field, errors, { required = false, min = 2, max = 120 } = {}) {
  if (value == null || value === '') {
    if (required) errors.push(`${field} es obligatorio.`);
    return;
  }
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max) {
    errors.push(`${field} debe ser texto de ${min} a ${max} caracteres.`);
  }
}

function checkEnum(value, field, allowed, errors, required = false) {
  if (value == null || value === '') {
    if (required) errors.push(`${field} es obligatorio.`);
    return;
  }
  if (!allowed.includes(value)) errors.push(`${field} debe ser uno de: ${allowed.join(', ')}.`);
}

function checkId(value, field, errors, required = false) {
  if (value == null || value === '') {
    if (required) errors.push(`${field} es obligatorio.`);
    return;
  }
  if (typeof value !== 'string' || !/^[a-f\d]{24}$/i.test(value)) {
    errors.push(`${field} debe ser un ObjectId válido.`);
  }
}

function checkPoint(point, field, errors) {
  if (!point || point.type !== 'Point') {
    errors.push(`${field} debe tener tipo GeoJSON Point.`);
    return;
  }
  const { validateGeoJSON } = require('./geoJson_validator');
  const error = validateGeoJSON('Point', point.coordinates);
  if (error) errors.push(`${field}: ${error}`);
}

module.exports = {
  isPlainObject,
  checkPatchBody,
  checkObject,
  checkText,
  checkEnum,
  checkId,
  checkPoint,
};
