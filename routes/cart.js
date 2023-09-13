const express = require('express')
const router = express.Router()
const isAuth = require('../middleware/is-auth')
const { body } = require('express-validator/check')

const {
    CreateCart,
    GetCarts,
    DeleteCart,
} = require('../controllers/cart')


// create
router.post(
    '/cart/add',
    isAuth,
    CreateCart
)
router.get('/carts', GetCarts)
router.get('/my-carts', isAuth, GetCarts)
router.delete('/cart/:productId', isAuth,
    DeleteCart)

module.exports = router
