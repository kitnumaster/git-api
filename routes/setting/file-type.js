const express = require('express')
const router = express.Router()
const isAuth = require('../../middleware/is-auth')
const { body } = require('express-validator/check')

const {
    CreateFileType,
    GetFileTypes,
    GetFileType,
    UpdateFileType,
} = require('../../controllers/setting/file-type')


// create
router.post(
    '/file-type',
    isAuth,
    [
        body('fileTypeName')
            .trim(),
    ],
    CreateFileType
)
router.get('/file-types', GetFileTypes)
router.get('/file-type/:fileTypeId', isAuth, GetFileType)
router.put('/file-type/:fileTypeId', isAuth,
    [
        body('fileTypeName')
            .trim(),
        body('active')
            .trim(),
    ],
    UpdateFileType)

module.exports = router
