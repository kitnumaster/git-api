const express = require('express')
const router = express.Router()
const isAuth = require('../middleware/is-auth')

const {
    DashboardOrder
} = require('../controllers/dashboard')

router.get('/dashboard-order', isAuth, DashboardOrder)


module.exports = router
