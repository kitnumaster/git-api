const { validationResult } = require('express-validator/check')
const JewerlyType = require('../../models/setting/jewelry-type')

const CreateJewerlyType = (req, res, next) => {
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

    const jewerlyTypeName = req.body.jewerlyTypeName
    const jewerlyTypeNameTH = req.body.jewerlyTypeNameTH
    const jewerlyType = new JewerlyType({
        jewerlyTypeName: jewerlyTypeName,
        jewerlyTypeNameTH: jewerlyTypeNameTH,
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
    JewerlyType.find(query)
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
    if (req.userType != 'admin') {
        const error = new Error('Permission denied.');
        error.statusCode = 403;
        throw error;
    }
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
    if (req.userType != 'admin') {
        const error = new Error('Permission denied.');
        error.statusCode = 403;
        throw error;
    }
    const jewerlyTypeId = req.params.jewerlyTypeId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }

    const jewerlyTypeName = req.body.jewerlyTypeName
    const jewerlyTypeNameTH = req.body.jewerlyTypeNameTH
    const active = req.body.active
    JewerlyType.findById(jewerlyTypeId)
        .then(jewerlyType => {
            if (!jewerlyType) {
                const error = new Error('Could not find.');
                error.statusCode = 404;
                throw error;
            }
            jewerlyType.jewerlyTypeName = jewerlyTypeName
            jewerlyType.jewerlyTypeNameTH = jewerlyTypeNameTH
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