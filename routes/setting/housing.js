const express = require('express')
const router = express.Router()
const isAuth = require('../../middleware/is-auth')
const { body } = require('express-validator/check')

const {
    CreateHousing,
    GetHousings,
    GetHousing,
    UpdateHousing,
} = require('../../controllers/setting/housing')


// create
router.post(
    '/housing',
    isAuth,
    [
        body('housingName')
            .trim(),
    ],
    CreateHousing
)
router.get('/housings', GetHousings)
router.get('/housing/:housingId', isAuth, GetHousing)
router.put('/housing/:housingId', isAuth,
    [
        body('housingName')
            .trim(),
        body('active')
            .trim(),
    ],
    UpdateHousing)

module.exports = router
