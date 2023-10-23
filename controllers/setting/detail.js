const { validationResult } = require('express-validator/check')
const Detail = require('../../models/setting/detail')

const CreateDetail = (req, res, next) => {
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

    const detailName = req.body.detailName
    const detailNameTH = req.body.detailNameTH
    const detail = new Detail({
        detailName: detailName,
        detailNameTH: detailNameTH,
    })
    detail
        .save()
        .then(result => {
            res.status(201).json({
                message: 'Created successfully!',
                detail: detail
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        });
}

const GetDetails = (req, res, next) => {
    // if (req.userType != 'admin') {
    //     const error = new Error('Permission denied.');
    //     error.statusCode = 403;
    //     throw error;
    // }
    Detail.find({})
        .then(details => {
            res.status(200).json({
                message: 'Fetched successfully.',
                details: details,
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

const GetDetail = (req, res, next) => {
    if (req.userType != 'admin') {
        const error = new Error('Permission denied.');
        error.statusCode = 403;
        throw error;
    }
    const detailId = req.params.detailId
    Detail.findById(detailId)
        .then(detail => {
            if (!detail) {
                const error = new Error('Could not find.');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({ message: 'fetched.', detail: detail })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

const UpdateDetail = (req, res, next) => {
    if (req.userType != 'admin') {
        const error = new Error('Permission denied.');
        error.statusCode = 403;
        throw error;
    }
    const detailId = req.params.detailId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }

    const detailName = req.body.detailName
    const active = req.body.active
    Detail.findById(detailId)
        .then(detail => {
            if (!detail) {
                const error = new Error('Could not find.');
                error.statusCode = 404;
                throw error;
            }
            detail.detailName = detailName
            detail.active = active
            return detail.save()
        })
        .then(result => {
            res.status(200).json({ message: 'Updated!', detail: result })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err);
        })
}

module.exports = {
    CreateDetail,
    GetDetails,
    GetDetail,
    UpdateDetail,
}