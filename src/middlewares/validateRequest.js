const AppError = require('../utils/appError');

function validateRequest(validator) {
  return (req, res, next) => {
    const errors = validator(req.body);
    if (errors.length) return next(new AppError(400, errors.join(' ')));
    next();
  };
}

module.exports = validateRequest;
