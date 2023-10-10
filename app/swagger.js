const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Diadem To-Do API Documentation',
      version: '1.0.0',
      description: 'Documentation of the to-do API',
    },
  },
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = {
  swaggerSpec
};
