const { randomUUID } = require('crypto');
const { User } = require('../models/user');

async function createUser(
  name
) {
  let user = new User({
    id: randomUUID(),
    name: name
  });

  try {
    const result = await user.save();
    return result;
  } catch (ex) {
    for (field in ex.errors) console.log(ex.errors[field].message);
  }
}

module.exports = { createUser }