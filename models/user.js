const { randomUUID } = require('crypto');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String, required: true },
});

const User = mongoose.model(
  'User', userSchema
); 

module.exports = { User }