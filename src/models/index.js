const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI, {
      useNewUrlParser: true,
      
    });
    console.log('Connected to MongoDB...');
  } catch (err) {
    console.log('Could not connect to MongoDB...', err);
  }
}

module.exports = {
  connectToDatabase,
};
