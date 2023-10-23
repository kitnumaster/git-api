const { validationResult } = require('express-validator/check')
const DesignerLevel = require('../../models/setting/designer-level')

const CreateDesignerLevel = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }
    if (req.userType != 'admin') {
        const error = new Error('Permission denied.');
        error.statusCode = 403;
        throw error;
    }

    const designerLevelName = req.body.designerLevelName
    const designerLevelNameTH = req.body.designerLevelNameTH
    const designerLevel = new DesignerLevel({
        designerLevelName: designerLevelName,
        designerLevelNameTH: designerLevelNameTH,
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

    DesignerLevel.find(query)
        .sort(sort)
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
    if (req.userType != 'admin') {
        const error = new Error('Permission denied.');
        error.statusCode = 403;
        throw error;
    }
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
    if (req.userType != 'admin') {
        const error = new Error('Permission denied.');
        error.statusCode = 403;
        throw error;
    }
    const designerLevelId = req.params.designerLevelId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }

    const designerLevelName = req.body.designerLevelName
    const designerLevelNameTH = req.body.designerLevelNameTH
    const active = req.body.active
    DesignerLevel.findById(designerLevelId)
        .then(designerLevel => {
            if (!designerLevel) {
                const error = new Error('Could not find.');
                error.statusCode = 404;
                throw error;
            }
            designerLevel.designerLevelName = designerLevelName
            designerLevel.designerLevelNameTH = designerLevelNameTH
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