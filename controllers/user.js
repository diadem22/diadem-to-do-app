const { User } = require('../models/user');

async function createUser(
  name,
  password
) {
  let user = User.create({
    username: name,
    password
  })

  try {
    const result = await user.save();
    return result;
  } catch (ex) {
    for (field in ex.errors) console.log(ex.errors[field].message);
  }
}

async function loginUser(
  name,
  password
) {
  const result = await User.findOne({ name, password})

  return result;
}



module.exports = { 
  createUser,
  loginUser
}