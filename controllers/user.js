const { User } = require('../models/user');

async function createUser(
  username,
  password
) {

  const exist = User.findOne({username})

  if(exist){
    return {message: 'username already exist'}
  } else {
    let user = new User({
      username: username,
      password: password,
    });

    try {
      const result = await user.save();
      return result;
    } catch (ex) {
      for (field in ex.errors) console.log(ex.errors[field].message);
    }
  }
  }
  

async function loginUser(
  username,
  password
) {
  const result = await User.findOne({ username, password})

  return result;
}



module.exports = { 
  createUser,
  loginUser
}