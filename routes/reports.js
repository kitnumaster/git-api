const express = require('express')
const router = express.Router()
const isAuth = require('../middleware/is-auth')
const { body } = require('express-validator/check')

const {
    ReportOrders,
} = require('../controllers/reports')
router.get('/orders', ReportOrders)

module.exports = router
