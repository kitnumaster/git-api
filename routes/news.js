const express = require('express')
const router = express.Router()
const isAuth = require('../middleware/is-auth')
const getInfo = require('../middleware/get-info')
const { body } = require('express-validator/check')

const {
    CreateNews,
    GetNewsLists,
    GetNews,
    UpdateNews,
    DeleteNews,
} = require('../controllers/news')


// create
router.post(
    '/news',
    isAuth,
    CreateNews
)
router.get('/news-lists', getInfo, GetNewsLists)
router.get('/news/:newsId', getInfo, GetNews)
router.put('/news/:newsId', isAuth,
    UpdateNews)
router.delete('/news/:newsId', isAuth,
    UpdateNews)

module.exports = router
