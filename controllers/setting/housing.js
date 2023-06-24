const { validationResult } = require('express-validator/check')
const Housing = require('../../models/setting/housing')

const CreateHousing = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }

    const housingName = req.body.housingName
    const housing = new Housing({
        housingName: housingName,
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

    Housing.find({})
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
    const housingId = req.params.housingId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }

    const housingName = req.body.housingName
    const active = req.body.active
    Housing.findById(housingId)
        .then(housing => {
            if (!housing) {
                const error = new Error('Could not find.');
                error.statusCode = 404;
                throw error;
            }
            housing.housingName = housingName
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