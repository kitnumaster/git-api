const express = require('express')
const router = express.Router()
const isAuth = require('../middleware/is-auth')
const getInfo = require('../middleware/get-info')
const { body } = require('express-validator/check')

const {
    CreateProduct,
    GetProducts,
    GetProduct,
    UpdateProduct,
    GetProductSummaries,
    UpdateProductSummaries,
    UserGetProducts,
    UserGetProduct,
    CreateProductSummariesManual,
    UserGetProductsHomepage,
    AddProductFavorite,
    DeleteProductFavorite,
    GetProductFavorites,
} = require('../controllers/product')


// create
router.post(
    '/my-product',
    isAuth,
    CreateProduct
)
router.get('/products', getInfo, UserGetProducts)
router.get('/products-shop', UserGetProducts)
router.get('/products-homepage', UserGetProductsHomepage)
router.get('/my-products', isAuth, GetProducts)
router.get('/product/:productId', getInfo, UserGetProduct)
router.put('/my-product/:productId', isAuth,
    UpdateProduct)
router.put('/product/:productId', isAuth,
    UpdateProduct)
router.get('/product-summaries', isAuth, GetProductSummaries)
router.post('/product-summaries', isAuth, CreateProductSummariesManual)
router.put('/product-summaries/:productSummaryId', isAuth,
    UpdateProductSummaries)
router.post('/products-fav', isAuth, AddProductFavorite)
router.get('/products-fav', isAuth, GetProductFavorites)
router.delete('/products-fav/:productId', isAuth, DeleteProductFavorite)

module.exports = router
