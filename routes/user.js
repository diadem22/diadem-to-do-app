const express = require('express');
const router = express.Router();
const {createUser, loginUser } = require('../controllers/user')

module.exports = (app) => {
  app.use('/user', router);

  router.post('/create', async (req, res, next) => {
    const { name, password } = req.body;
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password less than 6 characters' });
    }

    try {
      const user = await createUser(name, password);
      return res
        .status(200)
        .json({ data: user, success: true, message: 'User created' });
    } catch (err) {
      res.status(401).json({
        message: 'User not successful created',
        error: error.mesage,
      });
    }
  });

  router.get('/login', async(req, res, next) => {
      const { name, password } = req.body;

     try {
       const user = await loginUser(name, password)
       if (!user) {
         res.status(401).json({
           message: 'Login not successful',
           error: 'User not found',
         });
       } else {
         res.status(200).json({
           message: 'Login successful',
           user,
         });
       }
     } catch (error) {
       res.status(400).json({
         message: 'An error occurred',
         error: error.message,
       });
     }
  })
};
