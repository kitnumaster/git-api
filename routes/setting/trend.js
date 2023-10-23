const express = require('express')
const router = express.Router()
const isAuth = require('../../middleware/is-auth')
const { body } = require('express-validator/check')

const {
    CreateTrend,
    GetTrends,
    GetTrend,
    UpdateTrend,
} = require('../../controllers/setting/trend')


// create
router.post(
    '/trend',
    isAuth,
    [
        body('trendName')
            .trim(),
    ],
    CreateTrend
)
router.get('/trends', GetTrends)
router.get('/trend/:trendId', isAuth, GetTrend)
router.put('/trend/:trendId', isAuth,
    [
        body('trendName')
            .trim(),
        body('active')
            .trim(),
    ],
    UpdateTrend)

module.exports = router
