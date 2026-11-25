"use strict";

const { checkText, checkId, checkPoint, checkPatchBody, isPlainObject } = require('./common_validator');

function validateUbicacion(body) {
  if (!isPlainObject(body)) {
    return ['El cuerpo debe ser un objeto JSON.'];
  }
  const errors = [];
  checkText(body.nombre, 'nombre', errors, { required: true, max: 120 });
  if (body.descripcion !== undefined) {
    checkText(body.descripcion, 'descripcion', errors, { required: false, max: 500 });
  }
  checkId(body.categoria, 'categoria', errors, true);
  if (body.zona !== undefined) {
    checkId(body.zona, 'zona', errors, false);
  }
  checkPoint(body.ubicacion, 'ubicacion', errors);
  return errors;
}

function validateUbicacionPatch(body) {
  const patchErr = checkPatchBody(body);
  if (patchErr) return patchErr;
  const errors = [];
  if ('nombre' in body) checkText(body.nombre, 'nombre', errors, { required: true, max: 120 });
  if ('descripcion' in body) checkText(body.descripcion, 'descripcion', errors, { required: false, max: 500 });
  if ('categoria' in body) checkId(body.categoria, 'categoria', errors, true);
  if ('zona' in body) checkId(body.zona, 'zona', errors, false);
  if ('ubicacion' in body) checkPoint(body.ubicacion, 'ubicacion', errors);
  return errors;
}

module.exports = { validateUbicacion, validateUbicacionPatch };
