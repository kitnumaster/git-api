const express = require('express')
const router = express.Router()
const isAuth = require('../middleware/is-auth')
const { body } = require('express-validator/check')

const {
    CreateOrder,
    GetOrders,
    DeleteOrder,
} = require('../controllers/order')


// create
router.post(
    '/order',
    isAuth,
    CreateOrder
)
router.get('/orders', isAuth, GetOrders)
router.get('/my-orders', isAuth, GetOrders)
router.delete('/order/:productId', isAuth,
    DeleteOrder)

module.exports = router
