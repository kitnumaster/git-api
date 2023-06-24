const express = require('express')
const router = express.Router()
const isAuth = require('../../middleware/is-auth')
const { body } = require('express-validator/check')

const {
    CreateJewerlyType,
    GetJewerlyTypes,
    GetJewerlyType,
    UpdateJewerlyType,
} = require('../../controllers/setting/jewerly-type')


// create
router.post(
    '/jewerly-type',
    isAuth,
    [
        body('jewerlyTypeName')
            .trim(),
    ],
    CreateJewerlyType
)
router.get('/jewerly-types', isAuth, GetJewerlyTypes)
router.get('/jewerly-type/:jewerlyTypeId', isAuth, GetJewerlyType)
router.put('/jewerly-type/:jewerlyTypeId', isAuth,
    [
        body('jewerlyTypeName')
            .trim(),
        body('active')
            .trim(),
    ],
    UpdateJewerlyType)

module.exports = router
