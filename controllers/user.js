const { User } = require('../models/user');

async function createUser(
  username,
  password
) {
  let user = new User({
    username: username,
    password: password,
  });
  const exist = await User.findOne({ username });

  if (exist.username == username) {
    return res.status(400).json({ message: 'Username already exists' });
  }
  try {
    const result = await user.save();
    return result;
  } catch (ex) {
    for (field in ex.errors) console.log(ex.errors[field].message);
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