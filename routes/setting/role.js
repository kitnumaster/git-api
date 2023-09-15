const express = require('express')
const router = express.Router()
const isAuth = require('../../middleware/is-auth')
const { body } = require('express-validator/check')

const {
    CreateRole,
    GetRoles,
    GetRole,
    UpdateRole,
} = require('../../controllers/setting/role')


// create
router.post(
    '/role',
    isAuth,
    CreateRole
)
router.get('/roles', isAuth, GetRoles)
router.get('/role/:roleId', isAuth, GetRole)
router.put('/role/:roleId', isAuth,
    UpdateRole)

module.exports = router
