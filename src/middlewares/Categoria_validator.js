"use strict";

const { checkText, checkId } = require('./common_validator');

function validateCategoria(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return ['El cuerpo debe ser un objeto JSON.'];
  }
  const errors = [];
  checkText(body.nombre, 'nombre', errors, { required: true, max: 120 });
  if (body.descripcion !== undefined) {
    checkText(body.descripcion, 'descripcion', errors, { required: false, max: 500 });
  }
  return errors;
}

function validateCategoriaPatch(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return ['El cuerpo debe ser un objeto JSON.'];
  }
  const keys = Object.keys(body);
  if (keys.length === 0) {
    return ['Debe enviar al menos un campo para actualizar.'];
  }
  const errors = [];
  if ('nombre' in body) checkText(body.nombre, 'nombre', errors, { required: true, max: 120 });
  if ('descripcion' in body) checkText(body.descripcion, 'descripcion', errors, { required: false, max: 500 });
  return errors;
}

module.exports = { validateCategoria, validateCategoriaPatch };
