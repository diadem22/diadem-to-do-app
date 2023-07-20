const jwt = require('jsonwebtoken');
const { User } = require('../models/user');
const { Blacklist } = require('../models/blacklist');
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


        try {
          jwt.verify(cookie, process.env.SECRET_TOKEN, async (err, decoded) => {
            if (err) {
              return res.sendStatus(403);
            }

            const { id } = decoded;
            const user = await User;
            const { password, ...data } = user._doc;
            req.user = data;
            next();
          });
        } catch (err) {
          return res.status(401).send('Invalid Token');
        }
        return next();
};

async function verifyAccess (req, res, next) {
    const user_id = req.body['user_id'];
    const authHeader = req.headers['cookie'];

    if (!authHeader) return res.sendStatus(401);
    const cookie = authHeader.split('=')[1];


    const user = await User.findOne({ _id: user_id})
    
    try {
        if (user.token == cookie) return next();
    } catch (error) {
        return res.status(401).send('Access Not Authorized');
    }

}

async function verifyUsername(req, res, next) {
    const name = req.body['username']
    try {
        const exist = User.findOne({ username: name})
        if (!exist) {
          return next();
        } else {
             return res
               .status(401)
               .json({ message: 'Username exist' });
        }
    } catch (error) {
        console.log(error)
    }
    return next()
}

module.exports = {
  verifyToken,
  verifyAccess,
  verifyUsername
};
