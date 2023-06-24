const { validationResult } = require('express-validator/check')
const JewerlyType = require('../../models/setting/jewelry-type')

const CreateJewerlyType = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }

    const jewerlyTypeName = req.body.jewerlyTypeName
    const jewerlyType = new JewerlyType({
        jewerlyTypeName: jewerlyTypeName,
    })
    jewerlyType
        .save()
        .then(result => {
            res.status(201).json({
                message: 'Created successfully!',
                jewerlyType: jewerlyType
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        });
}

const GetJewerlyTypes = (req, res, next) => {

    JewerlyType.find({})
        .then(jewerlyTypes => {
            res.status(200).json({
                message: 'Fetched successfully.',
                jewerlyTypes: jewerlyTypes,
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

const GetJewerlyType = (req, res, next) => {
    const jewerlyTypeId = req.params.jewerlyTypeId
    JewerlyType.findById(jewerlyTypeId)
        .then(jewerlyType => {
            if (!jewerlyType) {
                const error = new Error('Could not find.');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({ message: 'fetched.', jewerlyType: jewerlyType })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

const UpdateJewerlyType = (req, res, next) => {
    const jewerlyTypeId = req.params.jewerlyTypeId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }

    const jewerlyTypeName = req.body.jewerlyTypeName
    const active = req.body.active
    JewerlyType.findById(jewerlyTypeId)
        .then(jewerlyType => {
            if (!jewerlyType) {
                const error = new Error('Could not find.');
                error.statusCode = 404;
                throw error;
            }
            jewerlyType.jewerlyTypeName = jewerlyTypeName
            jewerlyType.active = active
            return jewerlyType.save()
        })
        .then(result => {
            res.status(200).json({ message: 'Updated!', jewerlyType: result })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err);
        })
}

module.exports = {
    CreateJewerlyType,
    GetJewerlyTypes,
    GetJewerlyType,
    UpdateJewerlyType,
}