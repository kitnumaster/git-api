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

const {
    TestSendEmail
} = require('../controllers/email')

router.get('/orders', ReportOrders)
router.get('/customers', ReportCustomers)
router.get('/designers', ReportDesigners)
router.get('/designs', ReportDesigns)
router.get('/designer-orders', ReportDesignerOrders)
router.post('/test-email', TestSendEmail)

module.exports = router
