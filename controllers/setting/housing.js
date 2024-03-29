const { validationResult } = require('express-validator/check')
const Housing = require('../../models/setting/housing')
const moment = require('moment')
const CreateHousing = (req, res, next) => {
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

    const housingName = req.body.housingName
    const housingNameTH = req.body.housingNameTH
    const housing = new Housing({
        housingName: housingName,
        housingNameTH: housingNameTH,
    })
    housing
        .save()
        .then(result => {
            res.status(201).json({
                message: 'Created successfully!',
                housing: housing
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        });
}

const GetHousings = (req, res, next) => {
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
    Housing.find(query)
        .then(housings => {
            res.status(200).json({
                message: 'Fetched successfully.',
                housings: housings,
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

const GetHousing = (req, res, next) => {
    if (req.userType != 'admin') {
        const error = new Error('Permission denied.');
        error.statusCode = 403;
        throw error;
    }
    const housingId = req.params.housingId
    Housing.findById(housingId)
        .then(housing => {
            if (!housing) {
                const error = new Error('Could not find.');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({ message: 'fetched.', housing: housing })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

const UpdateHousing = (req, res, next) => {
    if (req.userType != 'admin') {
        const error = new Error('Permission denied.');
        error.statusCode = 403;
        throw error;
    }
    const housingId = req.params.housingId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }

    const housingName = req.body.housingName
    const housingNameTH = req.body.housingNameTH
    const active = req.body.active
    Housing.findById(housingId)
        .then(housing => {
            if (!housing) {
                const error = new Error('Could not find.');
                error.statusCode = 404;
                throw error;
            }
            housing.housingName = housingName
            housing.housingNameTH = housingNameTH
            housing.active = active
            return housing.save()
        })
        .then(result => {
            res.status(200).json({ message: 'Updated!', housing: result })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err);
        })
}

module.exports = {
    CreateHousing,
    GetHousings,
    GetHousing,
    UpdateHousing,
}