const { randomUUID } = require('crypto');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true
  },
  password: {
    type: String,
    minlength: 6,
    required: true,
  }
});

const User = mongoose.model(
  'User', userSchema
); 

module.exports = { User }