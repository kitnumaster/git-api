const { validationResult } = require('express-validator/check')
const Material = require('../../models/setting/material')

const CreateMaterial = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }

    const materialName = req.body.materialName
    const material = new Material({
        materialName: materialName,
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

    Material.find({})
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
    const materialId = req.params.materialId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }

    const materialName = req.body.materialName
    const active = req.body.active
    Material.findById(materialId)
        .then(material => {
            if (!material) {
                const error = new Error('Could not find.');
                error.statusCode = 404;
                throw error;
            }
            material.materialName = materialName
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