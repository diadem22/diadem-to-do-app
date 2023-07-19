const dotenv = require('dotenv')
dotenv.config();

const { MONGO_DB_URI, PORT, SECRET_TOKEN } = process.env;

const config =  { MONGO_DB_URI, PORT, SECRET_TOKEN };

module.exports = { config }
