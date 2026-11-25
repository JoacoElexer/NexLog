"use strict";

const {
  isPlainObject,
  checkPatchBody,
  checkObject,
  checkText,
  checkEnum,
  checkId,
  checkPoint,
} = require('./common_validator');

const ESTADOS_ENTREGA = ['pendiente', 'asignada', 'en_ruta', 'entregada', 'incidencia', 'cancelada'];

function checkDestinatario(body, errors) {
  if (checkObject(body, 'destinatario', errors)) {
    checkText(body.destinatario.nombre, 'destinatario.nombre', errors, { required: true });
    checkText(body.destinatario.telefono, 'destinatario.telefono', errors, { required: true, max: 30 });
  }
}

function checkDireccionDestino(body, errors) {
  if (checkObject(body, 'direccionDestino', errors)) {
    for (const field of ['calle', 'ciudad', 'estado']) {
      checkText(body.direccionDestino[field], `direccionDestino.${field}`, errors, { required: true, max: 200 });
    }
  }
}

function validateEntrega(body) {
  if (!isPlainObject(body)) {
    return ['El cuerpo debe ser un objeto JSON.'];
  }
  const errors = [];
  checkDestinatario(body, errors);
  checkText(body.categoria, 'categoria', errors, { required: true });
  checkDireccionDestino(body, errors);
  checkPoint(body.destino, 'destino', errors);
  for (const field of ['centro', 'zona', 'ruta']) checkId(body[field], field, errors);
  checkEnum(body.estado, 'estado', ESTADOS_ENTREGA, errors);
  checkText(body.observaciones, 'observaciones', errors, { max: 1000 });
  return errors;
}

function validateEntregaPatch(body) {
  const bodyErrors = checkPatchBody(body);
  if (bodyErrors) return bodyErrors;

  const errors = [];
  if ('destinatario' in body) checkDestinatario(body, errors);
  if ('categoria' in body) checkText(body.categoria, 'categoria', errors, { required: true });
  if ('direccionDestino' in body) checkDireccionDestino(body, errors);
  if ('destino' in body) checkPoint(body.destino, 'destino', errors);
  for (const field of ['centro', 'zona', 'ruta']) {
    if (field in body) checkId(body[field], field, errors);
  }
  if ('estado' in body) checkEnum(body.estado, 'estado', ESTADOS_ENTREGA, errors, true);
  if ('observaciones' in body) checkText(body.observaciones, 'observaciones', errors, { max: 1000 });
  return errors;
}

module.exports = { validateEntrega, validateEntregaPatch };
