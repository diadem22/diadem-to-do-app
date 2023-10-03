const { User } = require('../models/user');

async function createUser(
  username,
  password,
  email
) {
  let user = new User({
    username: username,
    password: password,
    email: email
  });
  
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



module.exports = { 
  createUser,
  loginUser
}