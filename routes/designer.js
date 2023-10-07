const express = require('express')
const router = express.Router()
const getInfo = require('../middleware/get-info')
const { body } = require('express-validator/check')

const {
    GetDesigners,
    GetDesigner,
} = require('../controllers/designer')

router.get('/designers', GetDesigners)
router.get('/designer/:designerId', getInfo, GetDesigner)

module.exports = router
