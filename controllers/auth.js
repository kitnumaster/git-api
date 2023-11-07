const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Account = require('../models/account');
const LoginLog = require('../models/log/loginLog')
const emailCtr = require('./email')

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  const phone = req.body.phone;
  const role = req.body.role;
  bcrypt
    .hash(password, 12)
    .then(hashedPw => {
      const user = new User({
        email: email,
        password: hashedPw,
        name: name,
        phone: phone,
        role: role
      });
      return user.save();
    })
    .then(result => {
      res.status(201).json({ message: 'User created!', userId: result._id });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        const error = new Error('A user with this email could not be found.');
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then(isEqual => {
      if (!isEqual) {
        const error = new Error('Wrong password!');
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString(),
          name: loadedUser.name,
          userType: 'admin'
        },
        'NLd0tmV6hw',
        { expiresIn: '24h' }
      );
      res.status(200).json({ token: token, userId: loadedUser._id.toString() });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.CurrentUser = (req, res, next) => {
  const userId = req.userId
  User.findById(userId)
    .populate("role")
    .then(user => {
      if (!user) {
        const error = new Error('Could not find.');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: 'fetched.', user: user })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      next(err)
    })
}

exports.AccountCurrentUser = (req, res, next) => {
  const userId = req.userId
  Account.findById(userId)
    .then(account => {
      if (!account) {
        const error = new Error('Could not find.');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: 'fetched.', account: account })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      next(err)
    })
}

exports.AccountSignup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const userName = req.body.userName;
  const password = req.body.password;
  const acceptPolicy = req.body.acceptPolicy;
  bcrypt
    .hash(password, 12)
    .then(hashedPw => {
      const account = new Account({
        email: email,
        password: hashedPw,
        userName: userName,
        acceptPolicy: acceptPolicy,
      });

      //send email
      //admin user
      emailCtr.NewUser(email)

      return account.save();
    })
    .then(result => {
      res.status(201).json({ message: 'User created!', userId: result._id });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.AccountLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  Account.findOne({ email: email })
    .then(user => {
      if (!user) {
        const error = new Error('A user with this email could not be found.');
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then(isEqual => {
      if (!isEqual) {
        const error = new Error('Wrong password!');
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString(),
          userType: loadedUser.userType
        },
        'NLd0tmV6hw',
        { expiresIn: '24h' }
      );
      addLoginLog(loadedUser._id)
      res.status(200).json({ token: token, userId: loadedUser._id.toString() });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.GetAdmins = (req, res, next) => {
  if (req.userType == 'admin') {
    User.find({})
      .then(details => {
        res.status(200).json({
          message: 'Fetched successfully.',
          details: details,
        });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500
        } 
        next(err)
      })
  } else {
    const error = new Error('Permission denied.');
    error.statusCode = 403;
    throw error;
  }
}

exports.UpdatePassword = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;
  const userId = req.params.userId
  // console.log({ _id: userId })
  let loadedUser;
  User.findOne({ _id: userId })
    .then(user => {
      if (!user) {
        const error = new Error('A user could not be found.');
        error.statusCode = 401;
        throw error;
      }
      // console.log(oldPassword)
      loadedUser = user;
      return bcrypt.compare(oldPassword, user.password);
    })
    .then(isEqual => {
      if (!isEqual) {
        const error = new Error('Wrong password!');
        error.statusCode = 401;
        throw error;
      }
      // console.log("a")
      bcrypt
        .hash(newPassword, 12)
        .then(hashedPw => {

          loadedUser.password = hashedPw
          return loadedUser.save();
        })
    })
    .then(result => {
      res.status(200).json({ message: 'Updated!' })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.UpdateAdmin = (req, res, next) => {
  const userId = req.params.userId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }

  const update = req.body
  // console.log(update)
  User.findById(userId)
    .then(user => {
      if (!user) {
        const error = new Error('Could not find.');
        error.statusCode = 404;
        throw error;
      }
      return User.findByIdAndUpdate(userId, update, { new: true })
    })
    .then(result => {
      res.status(200).json({ message: 'Updated!', role: result })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      next(err);
    })
}

exports.AccountUpdatePassword = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;
  const accountId = req.params.accountId
  // console.log({ _id: userId })
  let loadedUser;
  Account.findOne({ _id: accountId })
    .then(account => {
      if (!account) {
        const error = new Error('A user could not be found.');
        error.statusCode = 401;
        throw error;
      }
      // console.log(oldPassword)
      loadedUser = account;
      return bcrypt.compare(oldPassword, account.password);
    })
    .then(isEqual => {
      if (!isEqual) {
        const error = new Error('Wrong password!');
        error.statusCode = 401;
        throw error;
      }
      // console.log("a")
      bcrypt
        .hash(newPassword, 12)
        .then(hashedPw => {

          loadedUser.password = hashedPw
          return loadedUser.save();
        })
    })
    .then(result => {
      res.status(200).json({ message: 'Updated!' })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.SetToken = (loadedUser) => {

  const token = jwt.sign(
    {
      email: loadedUser.email,
      userId: loadedUser._id.toString(),
      userType: loadedUser.userType
    },
    'NLd0tmV6hw',
    { expiresIn: '24h' }
  );

  return token

}

const addLoginLog = async (account) => {

  const loginLog = new LoginLog({
    account: account,
  });
  await loginLog.save();

}