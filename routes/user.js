const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user');
const { createUser, loginUser } = require('../controllers/user');
const router = express.Router();
const {
  checkBlacklisted,
  createBlackList,
} = require('../controllers/blacklist');
const { verifyUsername } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const validateRequest = validate(true);

router.post(
  '/create',
  // validateRequest,
  verifyUsername,
  async (req, res, next) => {
    const { username, password } = req.body;

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password less than 6 characters' });
    }
    try {
      await createUser(username, password)
        .then((user) =>
          res.status(200).json({
            message: 'User successfully created',
            id: user._id,
          })
        )
        .catch((error) =>
          res.status(400).json({
            message: 'User not successful created',
            error: error.message,
          })
        );
    } catch (error) {
      res.status(400).json({
        message: 'An error occurred',
        error: error.message,
      });
    }
  }
);

router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await loginUser(username, password);
    if (!user) {
      res.status(400).json({ message: 'Invalid username or password' });
    } else {
      let options = {
        maxAge: 20 * 60 * 1000,
        httpOnly: true,
        secure: true,
        sameSite: 'None',
      };
      const token = jwt.sign({ id: user._id }, process.env.SECRET_TOKEN, {
        expiresIn: '20m',
      });
      user.token = token;
      res.cookie('token', token, options);
      res.status(200).json({
        status: 'success',
        message: 'You have successfully logged in.',
        user_id: user._id,
      });
    }
  } catch (error) {
    res.status(400).json({
      message: 'An error occurred',
      error: error.message,
    });
  }
});

router.get('/logout', async (req, res) => {
  try {
    const authHeader = req.headers['cookie'];
    if (!authHeader) return res.sendStatus(204);

    const cookie = authHeader.split('=')[1];
    const accessToken = cookie.split(';')[0];
    const ifBlacklisted = await checkBlacklisted(accessToken);

    if (ifBlacklisted) return res.sendStatus(204);

    await createBlackList(accessToken);

    res.setHeader('Clear-Site-Data', '"cookies", "storage"');
    res.status(200).json({ message: 'You are logged out!' });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }
});

module.exports = router;
