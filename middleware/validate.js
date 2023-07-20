const { celebrate } = require('celebrate');

const validate = (schema) => (req, res, next) =>
  celebrate(schema, {
    abortEarly: false,
    stripUnknown: true,
    allowUnknown: true,
  })(req, res, next);

module.exports = { validate };
