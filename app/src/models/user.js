const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    minlength: 6,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: async function (email) {
        const user = await this.constructor.findOne({ email });
        return !user; 
      },
      message: 'Email address is already in use.',
    },
  },
  token: {
    type: String,
  },
  timezone: {
    type: String,
    required: true,
  },
});

const User = mongoose.model('User', UserSchema);

module.exports = { User };
