const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    minlength: 6,
    required: true,
  },
  token: {
    type: String
  }
});



const User = mongoose.model('User', UserSchema);

module.exports = { User };
