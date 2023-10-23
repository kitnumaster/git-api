const express = require('express')
const router = express.Router()
const isAuth = require('../../middleware/is-auth')
const { body } = require('express-validator/check')

const {
    CreateSet,
    GetSets,
    GetSet,
    UpdateSet,
} = require('../../controllers/setting/set')


// create
router.post(
    '/set',
    isAuth,
    [
        body('setName')
            .trim(),
    ],
    CreateSet
)
router.get('/sets', GetSets)
router.get('/set/:setId', isAuth, GetSet)
router.put('/set/:setId', isAuth,
    [
        body('setName')
            .trim(),
        body('active')
            .trim(),
    ],
    UpdateSet)

module.exports = router
