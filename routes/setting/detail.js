const express = require('express')
const router = express.Router()
const isAuth = require('../../middleware/is-auth')
const { body } = require('express-validator/check')

const {
    CreateDetail,
    GetDetails,
    GetDetail,
    UpdateDetail,
} = require('../../controllers/setting/detail')


// create
router.post(
    '/detail',
    isAuth,
    [
        body('detailName')
            .trim(),
    ],
    CreateDetail
)
router.get('/details', isAuth, GetDetails)
router.get('/detail/:detailId', isAuth, GetDetail)
router.put('/detail/:detailId', isAuth,
    [
        body('detailName')
            .trim(),
        body('active')
            .trim(),
    ],
    UpdateDetail)

module.exports = router
