const express = require('express')
const router = express.Router()
const isAuth = require('../middleware/is-auth')
const { body } = require('express-validator/check')

const {
    GetAccounts,
    GetAccount,
    UpdateAccount,
    ApproveAccount,
    ActivateAccount,
    ResetPassword,
} = require('../controllers/account')

router.get('/accounts', isAuth, GetAccounts)
router.get('/account/:accountId', isAuth, GetAccount) //admin only
router.get('/my-account', isAuth, GetAccount)
router.put('/account/:accountId', isAuth,
    UpdateAccount)
router.put('/my-account', isAuth,
    UpdateAccount)
router.put('/approve-designer/:accountId', isAuth,
    [
        body('approve')
            .trim()
            .not()
            .isEmpty()
    ],
    ApproveAccount) //admin only

router.get('/account/activate/:activateCode', ActivateAccount)
router.get('/forgot-password', ResetPassword)

module.exports = router
