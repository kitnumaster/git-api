const jwt = require('jsonwebtoken');

const Account = require("../models/account")

module.exports = async (req, res, next) => {
  try {
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
      let user = await Account.findById(decodedToken.userId, { userType: 1 })
      // console.log(user)
      req.userId = decodedToken.userId;
      req.email = decodedToken.email;
      req.userType = user.userType;

      // console.log(req)
    }

    next();
  } catch (error) {
    next(error);
  }

};
