const jwt = require('jsonwebtoken');
const { User } = require('../models/user');
const { Blacklist } = require('../models/blacklist');
const { Activity } = require('../models/activity');
const dotenv = require('dotenv');

dotenv.config();

async function verifyToken (req, res, next) {
    const authHeader = req.headers['cookie'];

    if (!authHeader) return res.sendStatus(401);
    const cookie = authHeader.split('=')[1];

    const checkBlacklist = await Blacklist.findOne({ token: cookie });
    if (checkBlacklist)
        return res
            .status(401)
            .json({ message: 'Session expired. Please re-login' });

          jwt.verify(cookie, process.env.SECRET_TOKEN, async (err) => {
            if (err) {
              return res.sendStatus(403);
            }
          });
        return next();
};

async function verifyAccess (req, res, next) {
    const user_id = req.body['user_id'];
    const authHeader = req.headers['cookie'];

    if (!authHeader) return res.sendStatus(401);
    const cookie = authHeader.split('=')[1];


    const user = await User.findOne({ _id: user_id})
   
        if (user.token == cookie) return next();
    
      return next();
}

async function verifyUsername(req, res, next) {
    const name = req.body['username']

    const exist = await User.findOne({ username: name });
        if (!exist) return next();
        else res.status(400).json({
          message: 'Username exists',
        });
}

async function checkActivityName(req, res, next) {
  const name = req.body['name'];
  const user_id = req.body['user_id'];

  const exist = await Activity.findOne({ name: name, user_id: user_id });
    if (!exist) return next();
    else return res.status(400).json({
      message: 'Activity exists',
    });
}

module.exports = {
  verifyToken,
  verifyAccess,
  verifyUsername,
  checkActivityName
};
