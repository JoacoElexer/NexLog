const AppError = require('../utils/appError');

function notFoundHandler(req, res, next) {
  next(new AppError(404, `Ruta no encontrada: ${req.method} ${req.path}`));
}

function logErrors(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error.statusCode >= 500 || !error.statusCode) {
    console.error('Error procesando petición:', error.name || 'Error');
  }
  next(error);
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  const statusCode = Number.isInteger(error.statusCode)
    ? error.statusCode
    : Number.isInteger(error.status)
      ? error.status
      : 500;

  res.status(statusCode).json({
    error: statusCode >= 500 ? 'Error interno del servidor.' : error.message,
  });
}

module.exports = { notFoundHandler, logErrors, errorHandler };
