const schemas = require('./schemas');

const supportedMethods = ['post', 'put', 'patch', 'delete', 'get'];

const validationOptions = {
  abortEarly: false,
  allowUnknown: false,
  stripUnknown: false,
};

const schemaValidator = (path, useJoiError = true) => {
  const schema = schemas[path];

  if (!schema) {
    throw new Error(`Schema not found for path: ${path}`);
  }

  return (req, res, next) => {
    const method = req.method.toLowerCase();

    if (!supportedMethods.includes(method)) {
      return next();
    }

    const { error, value } = schema.validate(req.body, validationOptions);

    if (error) {
      const customError = {
        status: 'failed',
        error: 'Invalid request. Please review the request and try again.',
      };

      const joiError = {
        status: 'failed',
        error: {
          original: error._original,
          details: error.details.map(({ message, type }) => ({
            message: message.replace(/['"]/g, ''),
            type,
          })),
        },
      };

      return res.status(422).json(useJoiError ? joiError : customError);
    }

    req.body = value;
    return next();
  };
};

module.exports = {schemaValidator};
