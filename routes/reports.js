const express = require('express')
const router = express.Router()
const isAuth = require('../middleware/is-auth')
const { body } = require('express-validator/check')

const {
    ReportOrders,
    ReportCustomers,
    ReportDesigners,
    ReportDesigns,
    ReportDesignerOrders,
} = require('../controllers/reports')
router.get('/orders', ReportOrders)
router.get('/customers', ReportCustomers)
router.get('/designers', ReportDesigners)
router.get('/designs', ReportDesigns)
router.get('/designer-orders', ReportDesignerOrders)

module.exports = router
