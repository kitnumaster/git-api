const express = require('express')
const router = express.Router()
const isAuth = require('../../middleware/is-auth')
const { body } = require('express-validator/check')

const {
    CreateDesignerLevel,
    GetDesignerLevels,
    GetDesignerLevel,
    UpdateDesignerLevel,
} = require('../../controllers/setting/designer-level')


// create
router.post(
    '/designer-level',
    isAuth,
    [
        body('designerLevelName')
            .trim(),
    ],
    CreateDesignerLevel
)
router.get('/designer-levels', GetDesignerLevels)
router.get('/designer-level/:designerLevelId', isAuth, GetDesignerLevel)
router.put('/designer-level/:designerLevelId', isAuth,
    [
        body('designerLevelName')
            .trim(),
        body('active')
            .trim(),
    ],
    UpdateDesignerLevel)

module.exports = router
