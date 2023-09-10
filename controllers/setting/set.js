const { validationResult } = require('express-validator/check')
const Set = require('../../models/setting/set')

const CreateSet = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }

    const setName = req.body.setName
    const setNameTH = req.body.setNameTH
    const set = new Set({
        setName: setName,
        setNameTH: setNameTH,
    })
    set
        .save()
        .then(result => {
            res.status(201).json({
                message: 'Created successfully!',
                set: set
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        });
}

const GetSets = (req, res, next) => {

    Set.find({})
        .then(sets => {
            res.status(200).json({
                message: 'Fetched successfully.',
                sets: sets,
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

const GetSet = (req, res, next) => {
    const setId = req.params.setId
    Set.findById(setId)
        .then(set => {
            if (!set) {
                const error = new Error('Could not find.');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({ message: 'fetched.', set: set })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

const UpdateSet = (req, res, next) => {
    const setId = req.params.setId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }

    const setName = req.body.setName
    const setNameTH = req.body.setNameTH
    const active = req.body.active
    Set.findById(setId)
        .then(set => {
            if (!set) {
                const error = new Error('Could not find.');
                error.statusCode = 404;
                throw error;
            }
            set.setName = setName
            set.setNameTH = setNameTH
            set.active = active
            return set.save()
        })
        .then(result => {
            res.status(200).json({ message: 'Updated!', set: result })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err);
        })
}

module.exports = {
    CreateSet,
    GetSets,
    GetSet,
    UpdateSet,
}