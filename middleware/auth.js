const jwt = require('jsonwebtoken');

function verifyToken (req, res, next) {
  const token = req.headers.token;

  if (!token) {
    return res.status(403).send('No token provided');
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send('Invalid Token');
  }
  return next();
};

module.exports = {verifyToken};
