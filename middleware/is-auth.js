const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
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
