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
    DownloadProduct,
    CreditCardPayment,
} = require('../controllers/order')


// create
router.post(
    '/order',
    isAuth,
    CreateOrder
)
router.get('/orders', isAuth, GetOrders)
router.get('/my-orders', isAuth, GetOrders)
router.get('/order/:orderId', isAuth, GetOrder)
router.put('/order/:orderId', UpdateOrder)
router.delete('/order/:orderId', isAuth,
    DeleteOrder)
router.get('/my-sale-orders', isAuth, GetOrderProductOrders)
router.get('/product-download/:productId', isAuth, DownloadProduct)
router.post(
    '/enroll/payment-credit-card-success',
    CreditCardPayment
)

module.exports = router
