const express = require('express')
const router = express.Router()
const getInfo = require('../middleware/get-info')
const isAuth = require('../middleware/is-auth')
const { body } = require('express-validator/check')

const {
    GetDesigners,
    GetDesigner,
    AddDesignerFavorite,
    DeleteDesignerFavorite,
    GetDesignerFavorites
} = require('../controllers/designer')

router.get('/designers', GetDesigners)
router.get('/designer/:designerId', getInfo, GetDesigner)
router.post('/designer-fav', isAuth, AddDesignerFavorite)
router.get('/designer-fav', isAuth, GetDesignerFavorites)
router.delete('/designer-fav/:designerId', isAuth, DeleteDesignerFavorite)

module.exports = router
