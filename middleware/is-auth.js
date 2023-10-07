const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  const ipAddresses = req.header('x-forwarded-for') || req.socket.remoteAddress
  if (!authHeader) {
    const error = new Error('Not authenticated.');
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(' ')[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, 'NLd0tmV6hw');
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    const error = new Error('Not authenticated.');
    error.statusCode = 401;
    throw error;
  }
  req.ipAddresses = ipAddresses
  if (decodedToken.userType == 'admin') {
    req.userId = decodedToken.userId;
    req.email = decodedToken.email;
    req.name = decodedToken.name;
    req.userType = decodedToken.userType;
  } else {
    req.userId = decodedToken.userId;
    req.email = decodedToken.email;
    req.userType = decodedToken.userType;
  }

  next();
};
