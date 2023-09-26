const express = require('express')
const router = express.Router()
const isAuth = require('../middleware/is-auth')
const { body } = require('express-validator/check')

const {
    CreateProduct,
    GetProducts,
    GetProduct,
    UpdateProduct,
    GetProductSummaries,
    UpdateProductSummaries,
} = require('../controllers/product')


// create
router.post(
    '/my-product',
    isAuth,
    CreateProduct
)
router.get('/products', GetProducts)
router.get('/my-products', isAuth, GetProducts)
router.get('/product/:productId', GetProduct)
router.put('/my-product/:productId', isAuth,
    UpdateProduct)
router.put('/product/:productId', isAuth,
    UpdateProduct)
router.get('/product-summaries', GetProductSummaries)
router.put('/product-summaries/:productSummaryId', isAuth,
    UpdateProductSummaries)

module.exports = router
