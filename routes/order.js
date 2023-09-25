const express = require('express')
const router = express.Router()
const isAuth = require('../middleware/is-auth')
const { body } = require('express-validator/check')

const {
    CreateOrder,
    GetOrders,
    DeleteOrder,
    GetOrder,
    UpdateOrder,
} = require('../controllers/order')


// create
router.post(
    '/order',
    isAuth,
    CreateOrder
)
router.get('/orders', isAuth, GetOrders)
router.get('/my-orders', isAuth, GetOrders)
router.get('/orders', isAuth, GetOrders)
router.get('/order/:orderId', isAuth, GetOrder)
router.put('/order/:orderId', isAuth, UpdateOrder)
router.delete('/order/:orderId', isAuth,
    DeleteOrder)

module.exports = router
