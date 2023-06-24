const express = require('express')
const router = express.Router()
const isAuth = require('../../middleware/is-auth')
const { body } = require('express-validator/check')

const {
    CreateMaterial,
    GetMaterials,
    GetMaterial,
    UpdateMaterial,
} = require('../../controllers/setting/material')


// create
router.post(
    '/material',
    isAuth,
    [
        body('materialName')
            .trim(),
    ],
    CreateMaterial
)
router.get('/materials', isAuth, GetMaterials)
router.get('/material/:materialId', isAuth, GetMaterial)
router.put('/material/:materialId', isAuth,
    [
        body('materialName')
            .trim(),
        body('active')
            .trim(),
    ],
    UpdateMaterial)

module.exports = router
