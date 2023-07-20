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
            const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
            req.user = decoded;
        } catch (err) {
            return res.status(401).send('Invalid Token');
    }
        return next();
};

async function verifyUser (req, res, next) {
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

module.exports = { 
    verifyToken,
    verifyUser
 };
