"use strict";

const AppError = require('../utils/appError');
const mongoose = require('mongoose');

function validateRequest(validator) {
  return (req, res, next) => {
    const errors = validator(req.body);
    if (errors.length) return next(new AppError(400, errors.join(' ')));
    next();
  };
}

function validateObjectIdParam(parameter = 'id') {
  return (req, res, next) => {
    if (!mongoose.isObjectIdOrHexString(req.params[parameter])) {
      return next(new AppError(400, `${parameter} debe ser un ObjectId válido.`));
    }
    next();
  };
}

module.exports = { validateRequest, validateObjectIdParam };
