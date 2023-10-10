const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user');
const { createUser, loginUser, updateUser } = require('../controllers/user');
const router = express.Router();
const {
  checkBlacklisted,
  createBlackList,
} = require('../controllers/blacklist');
const { verifyUsername, verifyAccess, verifyToken } = require('../middleware/auth');
const { schemaValidator } = require('../middleware/validate');

/**
 * @swagger
 * /user/create:
 *   post:
 *     summary: Create a new user account
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the new user.
 *               password:
 *                 type: string
 *                 description: The password of the new user.
 *               email:
 *                 type: string
 *                 description: The email address of the new user.
 *               timezone:
 *                 type: string
 *                 description: The timezone of the new user.
 *             required:
 *               - username
 *               - password
 *               - email
 *               - timezone
 *     responses:
 *       '200':
 *         description: User successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 timezone:
 *                   type: string
 *             examples:
 *               success:
 *                 value:
 *                   message: User successfully created
 *                   id: '5f4db09b05b724001c8d0d8c'
 *                   email: test@email.com
 *                   timezone: Africa/Lagos
 *       '400':
 *         description: User not successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *             examples:
 *               error:
 *                 value:
 *                   message: User not successfully created
 *                   error: Username already exists
 */

router.post(
  '/create',
  schemaValidator('/user/create'),
  verifyUsername,
  async (req, res, next) => {
    const { username, password, email, timezone } = req.body;

    await createUser(username, password, email, timezone)
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
        email: user.email,
        timezone: user.timezone
      });
    }
  }
);

router.put(
  '/update/:user_id',
  schemaValidator('/user/update'),
  verifyToken,
  verifyAccess,
  async (req, res, next) => {
    const { user_id } = req.params;
    const { email, timezone } = req.body;

      const user = await updateUser(user_id, email, timezone)
      return res
        .status(200)
        .json({ data: user, success: true, message: 'User updated' });
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
