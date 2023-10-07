const { User } = require('../models/user');
const moment = require('moment-timezone');
const { ObjectId } = require('mongoose').Types;

async function createUser(
  username,
  password,
  email,
  timezone
) {
  const existingUser = await User.findOne({
    email: email
  })
  let user;

  if(!existingUser && !!moment.tz.zone(timezone)) {
    user = new User({
      username: username,
      password: password,
      email: email,
      timezone: timezone,
    });
  } else {
    throw new Error(
      'Invalid timezone or email already in use'
    )
  }
  
  try {
    const result = await user.save();
    return result;
  } catch (ex) {
    for (field in ex.errors) return(ex.errors[field].message);
  }
}

async function loginUser(
  username,
  password
) {
   try {
     const result = await User.findOne({ username, password });

     return result;
   } catch (error) {
     console.error('Login failed:', error.message);
     throw error; 
   }
}

async function updateUser(user_id, email, timezone){
  try {
    const result = await User.findOneAndUpdate(
      {
        _id: new ObjectId(user_id),
      },
      {
        $set: {
          email: email,
          timezone: timezone
        },
      },
      {
        new: true,
      }
    );
     return result;
  } catch (error) {
    console.error('Error updating user:', error.message);
    throw error; 
  }
}




module.exports = { 
  createUser,
  loginUser,
  updateUser
}