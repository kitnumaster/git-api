const express = require('express');
const { body } = require('express-validator/check');

const User = require('../models/user');
const Account = require('../models/account');
const authController = require('../controllers/auth');
const isAuth = require('../middleware/is-auth');
const router = express.Router();

router.put(
  '/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject('E-Mail address already exists!');
          }
        });
      })
      .normalizeEmail(),
    body('password')
      .trim()
      .isLength({ min: 5 }),
    body('name')
      .trim()
      .not()
      .isEmpty()
  ],
  authController.signup
);

router.post('/login', authController.login)
router.get('/current-user', isAuth, authController.CurrentUser);
router.get('/admins', isAuth, authController.GetAdmins);
router.put('/admin/:userId', isAuth, authController.UpdateAdmin);
router.put('/edit-password/:userId', [
  body('oldPassword')
    .trim()
    .isLength({ min: 5 }),
  body('newPassword')
    .trim()
    .isLength({ min: 5 }),
], isAuth, authController.UpdatePassword);

router.put(
  '/account/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom((value, { req }) => {
        return Account.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject('E-Mail address already exists!');
          }
        });
      })
      .normalizeEmail(),
    body('password')
      .trim()
      .isLength({ min: 5 }),
    body('userName')
      .custom((value, { req }) => {
        return Account.findOne({ userName: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject('User name already exists!');
          }
        });
      }),
  ],
  authController.AccountSignup
);

router.post('/account/login', authController.AccountLogin)
router.get('/account/current-user', isAuth, authController.AccountCurrentUser);
router.put('/account/edit-password/:accountId', [
  body('oldPassword')
    .trim()
    .isLength({ min: 5 }),
  body('newPassword')
    .trim()
    .isLength({ min: 5 }),
], isAuth, authController.AccountUpdatePassword);

module.exports = router;
