const jwt =  require('jsonwebtoken');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
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

UserSchema.methods.generateAccessJWT = function () {
  let payload = {
    id: this._id,
  };
  return jwt.sign(payload, process.env.SECRET_TOKEN, {
    expiresIn: '20m',
  });
};

const User = mongoose.model('User', UserSchema);

module.exports = { User };
