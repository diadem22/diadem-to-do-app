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

    jwt.verify(cookie, process.env.SECRET_TOKEN,  async (err, decoded) => {
        if (err) {
            return res.sendStatus(403);
        }

    const { id } = decoded; 
    const user = await User; 
    const { password, ...data } = user._doc; 
    req.user = data; 
    next();
  });
}


//   if (!token) {
//     return res.status(403).send('No token provided');
//   }
//   try {
//     const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
//     req.user = decoded;
//   } catch (err) {
//     return res.status(401).send('Invalid Token');
//   }
//   return next();
// };

module.exports = {verifyToken};
