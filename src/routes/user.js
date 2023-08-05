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
const { schemaValidator } = require('../middleware/validate');

router.post(
  '/create',
  schemaValidator('/user/create'),
  verifyUsername,
  async (req, res, next) => {
    const { username, password } = req.body;

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
  }
);

router.post(
  '/login',
  schemaValidator('/user/login'),
  async (req, res, next) => {
    const { username, password } = req.body;
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
      await User.updateOne({ _id: user._id} , {token: token})
      res.cookie('token', token, options);
      res.status(200).json({
        status: 'success',
        message: 'You have successfully logged in.',
        user_id: user._id,
      });
    }
  }
);

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
