const { validationResult } = require('express-validator/check')
const Material = require('../../models/setting/material')
const moment = require('moment')
const CreateMaterial = (req, res, next) => {
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

    const materialName = req.body.materialName
    const materialNameTH = req.body.materialNameTH
    const material = new Material({
        materialName: materialName,
        materialNameTH: materialNameTH,
    })
    material
        .save()
        .then(result => {
            res.status(201).json({
                message: 'Created successfully!',
                material: material
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        });
}

const GetMaterials = (req, res, next) => {
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
    Material.find(query)
        .then(materials => {
            res.status(200).json({
                message: 'Fetched successfully.',
                materials: materials,
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

const GetMaterial = (req, res, next) => {
    if (req.userType != 'admin') {
        const error = new Error('Permission denied.');
        error.statusCode = 403;
        throw error;
    }
    const materialId = req.params.materialId
    Material.findById(materialId)
        .then(material => {
            if (!material) {
                const error = new Error('Could not find.');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({ message: 'fetched.', material: material })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

const UpdateMaterial = (req, res, next) => {
    if (req.userType != 'admin') {
        const error = new Error('Permission denied.');
        error.statusCode = 403;
        throw error;
    }
    const materialId = req.params.materialId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }

    const materialName = req.body.materialName
    const materialNameTH = req.body.materialNameTH
    const active = req.body.active
    Material.findById(materialId)
        .then(material => {
            if (!material) {
                const error = new Error('Could not find.');
                error.statusCode = 404;
                throw error;
            }
            material.materialName = materialName
            material.materialNameTH = materialNameTH
            material.active = active
            return material.save()
        })
        .then(result => {
            res.status(200).json({ message: 'Updated!', material: result })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err);
        })
}

module.exports = {
    CreateMaterial,
    GetMaterials,
    GetMaterial,
    UpdateMaterial,
}