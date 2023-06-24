const { validationResult } = require('express-validator/check')
const DesignerLevel = require('../../models/setting/designer-level')

const CreateDesignerLevel = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }

    const designerLevelName = req.body.designerLevelName
    const designerLevel = new DesignerLevel({
        designerLevelName: designerLevelName,
    })
    designerLevel
        .save()
        .then(result => {
            res.status(201).json({
                message: 'Created successfully!',
                designerLevel: designerLevel
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        });
}

const GetDesignerLevels = (req, res, next) => {

    DesignerLevel.find({})
        .then(designerLevels => {
            res.status(200).json({
                message: 'Fetched successfully.',
                designerLevels: designerLevels,
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

const GetDesignerLevel = (req, res, next) => {
    const designerLevelId = req.params.designerLevelId
    DesignerLevel.findById(designerLevelId)
        .then(designerLevel => {
            if (!designerLevel) {
                const error = new Error('Could not find.');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({ message: 'fetched.', designerLevel: designerLevel })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

const UpdateDesignerLevel = (req, res, next) => {
    const designerLevelId = req.params.designerLevelId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }

    const designerLevelName = req.body.designerLevelName
    const active = req.body.active
    DesignerLevel.findById(designerLevelId)
        .then(designerLevel => {
            if (!designerLevel) {
                const error = new Error('Could not find.');
                error.statusCode = 404;
                throw error;
            }
            designerLevel.designerLevelName = designerLevelName
            designerLevel.active = active
            return designerLevel.save()
        })
        .then(result => {
            res.status(200).json({ message: 'Updated!', designerLevel: result })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err);
        })
}

module.exports = {
    CreateDesignerLevel,
    GetDesignerLevels,
    GetDesignerLevel,
    UpdateDesignerLevel,
}