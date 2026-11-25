"use strict";

const {
  isPlainObject,
  checkPatchBody,
  checkObject,
  checkText,
  checkEnum,
  checkId,
} = require('./common_validator');
const { validateGeoJSON } = require('./geoJson_validator');

const ESTADOS_ZONA = ['activa', 'inactiva'];

function checkPolygon(body, errors) {
  if (checkObject(body, 'geometria', errors)) {
    if (body.geometria.type !== 'Polygon') errors.push('geometria.type debe ser Polygon.');
    const geometryError = validateGeoJSON('Polygon', body.geometria.coordinates);
    if (geometryError) errors.push(`geometria: ${geometryError}`);
  }
}

function validateZonaReparto(body) {
  if (!isPlainObject(body)) {
    return ['El cuerpo debe ser un objeto JSON.'];
  }
  const errors = [];
  checkText(body.nombre, 'nombre', errors, { required: true });
  checkText(body.descripcion, 'descripcion', errors, { required: true, max: 500 });
  checkId(body.centro, 'centro', errors, true);
  checkPolygon(body, errors);
  checkEnum(body.estado, 'estado', ESTADOS_ZONA, errors);
  return errors;
}

function validateZonaRepartoPatch(body) {
  const bodyErrors = checkPatchBody(body);
  if (bodyErrors) return bodyErrors;

  const errors = [];
  if ('nombre' in body) checkText(body.nombre, 'nombre', errors, { required: true });
  if ('descripcion' in body) checkText(body.descripcion, 'descripcion', errors, { required: true, max: 500 });
  if ('centro' in body) checkId(body.centro, 'centro', errors, true);
  if ('geometria' in body) checkPolygon(body, errors);
  if ('estado' in body) checkEnum(body.estado, 'estado', ESTADOS_ZONA, errors, true);
  return errors;
}

module.exports = { validateZonaReparto, validateZonaRepartoPatch };
