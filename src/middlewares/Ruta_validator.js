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

const ESTADOS_RUTA = ['planificada', 'en_curso', 'pausada', 'completada', 'cancelada'];

function checkParadas(paradas, errors) {
  if (!Array.isArray(paradas)) {
    errors.push('paradas debe ser una lista.');
    return;
  }
  const ordenes = new Set();
  paradas.forEach((parada, index) => {
    checkId(parada?.entrega, `paradas[${index}].entrega`, errors, true);
    if (!Number.isInteger(parada?.orden) || parada.orden < 1) {
      errors.push(`paradas[${index}].orden debe ser un entero positivo.`);
    } else if (ordenes.has(parada.orden)) {
      errors.push('El orden de las paradas no puede repetirse.');
    } else {
      ordenes.add(parada.orden);
    }
  });
}

function checkLineString(body, errors) {
  if (checkObject(body, 'geometria', errors)) {
    if (body.geometria.type !== 'LineString') errors.push('geometria.type debe ser LineString.');
    const geometryError = validateGeoJSON('LineString', body.geometria.coordinates);
    if (geometryError) errors.push(`geometria: ${geometryError}`);
  }
}

function validateRuta(body) {
  if (!isPlainObject(body)) {
    return ['El cuerpo debe ser un objeto JSON.'];
  }
  const errors = [];
  checkText(body.nombre, 'nombre', errors, { required: true });
  checkId(body.centro, 'centro', errors, true);
  checkId(body.repartidor, 'repartidor', errors);
  checkId(body.vehiculo, 'vehiculo', errors);
  checkParadas(body.paradas, errors);
  checkLineString(body, errors);
  checkEnum(body.estado, 'estado', ESTADOS_RUTA, errors);
  return errors;
}

function validateRutaPatch(body) {
  const bodyErrors = checkPatchBody(body);
  if (bodyErrors) return bodyErrors;

  const errors = [];
  if ('nombre' in body) checkText(body.nombre, 'nombre', errors, { required: true });
  if ('centro' in body) checkId(body.centro, 'centro', errors, true);
  if ('repartidor' in body) checkId(body.repartidor, 'repartidor', errors);
  if ('vehiculo' in body) checkId(body.vehiculo, 'vehiculo', errors);
  if ('paradas' in body) checkParadas(body.paradas, errors);
  if ('geometria' in body) checkLineString(body, errors);
  if ('estado' in body) checkEnum(body.estado, 'estado', ESTADOS_RUTA, errors, true);
  return errors;
}

module.exports = { validateRuta, validateRutaPatch };
