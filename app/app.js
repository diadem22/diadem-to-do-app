const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRoute = require('./src/routes/user');
const activityRoute = require('./src/routes/activity')
const dotenv = require('dotenv');
const { connectToDatabase } = require('./index');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

connectToDatabase();

dotenv.config();
const app = express();

app.use(cors())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Diadem To-Do API Documentation',
      version: '1.0.0',
      description: 'Documentation of the to-do API',
    },
    servers: [
      {
        url: 'http://localhost:6000',
      },
      {
        url: 'https://www.ifedaniel.com',
      },
    ],
    apis: ['./docs/openapi.json'],
  },
};

const swaggerSpec = swaggerJsdoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use('/user', userRoute)
app.use('/activity', activityRoute)

  app.get('/', (req, res) => {
    res.send('diadem-amd-gbensky.com');
  });

app.listen(process.env.PORT, () => {
  console.log(`Server is listening on port  ${process.env.PORT}....`);
});


