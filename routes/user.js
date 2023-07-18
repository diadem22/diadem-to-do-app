const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user');
const {createUser, loginUser } = require('../controllers/user')
const router = express.Router();

module.exports = (app) => {
    app.use('/user', router);

    router.post('/create', async (req, res, next) => {
    const { username, password } = req.body;
    
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password less than 6 characters' });
    }

    const exist = await User.findOne({ username });

    if (exist.username == username) {
      return res
        .status(400)
        .json({ message: 'Username already exists' });
    }
    try {
    await createUser(
      username,
      password
    )
      .then((user) =>
        res.status(200).json({
          message: "User successfully created",
          id: user._id
        })
      )
      .catch((error) =>
        res.status(400).json({
          message: "User not successful created",
          error: error.message,
        })
      );
  }catch (error) {
    res.status(400).json({
      message: "An error occurred",
      error: error.message,
    });
  } 
})

  router.post('/login', async (req, res, next) => {
    const { username, password } = req.body;

    try {
      const user = await loginUser(username, password);
        if (!user) {
          res.status(400).json({ message: 'Invalid username or password' });
        }else{
          const maxAge = 3 * 60 * 60;
          const token = jwt.sign(
            { id: user._id, username },
            process.env.SECRET_TOKEN,
            {
              expiresIn: maxAge, 
            }
          );
          res.status(201).json({
            message: "User successfully Logged in",
            user: user._id,
            token: token
          });
        } 
    }catch (error) {
    res.status(400).json({
      message: "An error occurred",
      error: error.message,
    });
  }
    }
  );
  }
