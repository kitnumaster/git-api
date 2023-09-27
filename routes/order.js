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
    GetOrderProductOrders,
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
router.get('/my-sale-orders', isAuth, GetOrderProductOrders)

module.exports = router
