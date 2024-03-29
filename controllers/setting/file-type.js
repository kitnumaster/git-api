const { validationResult } = require('express-validator/check')
const FileType = require('../../models/setting/file-type')
const moment = require('moment')
const CreateFileType = (req, res, next) => {
    if (req.userType != 'admin') {
        const error = new Error('Permission denied.');
        error.statusCode = 403;
        throw error;
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }

    const fileTypeName = req.body.fileTypeName
    const fileTypeNameTH = req.body.fileTypeNameTH
    const fileType = new FileType({
        fileTypeName: fileTypeName,
        fileTypeNameTH: fileTypeNameTH,
    })
    fileType
        .save()
        .then(result => {
            res.status(201).json({
                message: 'Created successfully!',
                fileType: fileType
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        });
}

const GetFileTypes = (req, res, next) => {
    // if (req.userType != 'admin') {
    //     const error = new Error('Permission denied.');
    //     error.statusCode = 403;
    //     throw error;
    // }
    let query = {}
    let dataDate = null
    if (req.query.createdAt) {
        dataDate = req.query.createdAt.split(":")
        date = moment(dataDate[0]).subtract(7, 'hours').format("YYYY-MM-DD")
        date2 = moment(dataDate[1]).format("YYYY-MM-DD")
        query.createdAt = {
            $gte: new Date(`${date} 17:00:00`),
            $lte: new Date(`${date2} 16:59:59`)
        }
    }
    let sort = {
        createdAt: -1
    }
    if (req.query.sortBy) {
        let sortBy = req.query.sortBy
        sort = {
            [sortBy]: req.query.sortType || -1
        }
    }
    FileType.find(query)
        .then(fileTypes => {
            res.status(200).json({
                message: 'Fetched successfully.',
                fileTypes: fileTypes,
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

const GetFileType = (req, res, next) => {
    if (req.userType != 'admin') {
        const error = new Error('Permission denied.');
        error.statusCode = 403;
        throw error;
    }
    const fileTypeId = req.params.fileTypeId
    FileType.findById(fileTypeId)
        .then(fileType => {
            if (!fileType) {
                const error = new Error('Could not find.');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({ message: 'fetched.', fileType: fileType })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

const UpdateFileType = (req, res, next) => {
    if (req.userType != 'admin') {
        const error = new Error('Permission denied.');
        error.statusCode = 403;
        throw error;
    }
    const fileTypeId = req.params.fileTypeId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }

    const fileTypeName = req.body.fileTypeName
    const fileTypeNameTH = req.body.fileTypeNameTH
    const active = req.body.active
    FileType.findById(fileTypeId)
        .then(fileType => {
            if (!fileType) {
                const error = new Error('Could not find.');
                error.statusCode = 404;
                throw error;
            }
            fileType.fileTypeName = fileTypeName
            fileType.fileTypeNameTH = fileTypeNameTH
            fileType.active = active
            return fileType.save()
        })
        .then(result => {
            res.status(200).json({ message: 'Updated!', fileType: result })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err);
        })
}

module.exports = {
    CreateFileType,
    GetFileTypes,
    GetFileType,
    UpdateFileType,
}