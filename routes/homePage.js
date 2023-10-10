const express = require('express')
const router = express.Router()
const isAuth = require('../middleware/is-auth')
const getInfo = require('../middleware/get-info')
const { body } = require('express-validator/check')

const {
    CreateHomePage,
    GetHomePageLists,
    GetHomePage,
    UpdateHomePage,
    DeleteHomePage,
} = require('../controllers/homePage')


// create
router.post(
    '/home-page',
    isAuth,
    CreateHomePage
)
router.get('/home-page-lists', getInfo, GetHomePageLists)
router.get('/home-page/:homePageId', getInfo, GetHomePage)
router.put('/home-page/:homePageId', isAuth,
    UpdateHomePage)
router.delete('/home-page/:homePageId', isAuth,
    UpdateHomePage)

module.exports = router
