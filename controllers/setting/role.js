const { validationResult } = require('express-validator/check')
const Role = require('../../models/setting/role')

const CreateRole = (req, res, next) => {
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

    const body = req.body
    const role = new Role(body)
    role
        .save()
        .then(result => {
            res.status(201).json({
                message: 'Created successfully!',
                role: role
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        });
}

const GetRoles = (req, res, next) => {
    if (req.userType != 'admin') {
        const error = new Error('Permission denied.');
        error.statusCode = 403;
        throw error;
    }
    Role.find({})
        .then(roles => {
            res.status(200).json({
                message: 'Fetched successfully.',
                roles: roles,
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

const GetRole = (req, res, next) => {
    if (req.userType != 'admin') {
        const error = new Error('Permission denied.');
        error.statusCode = 403;
        throw error;
    }
    const roleId = req.params.roleId
    Role.findById(roleId)
        .then(role => {
            if (!role) {
                const error = new Error('Could not find.');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({ message: 'fetched.', role: role })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

const UpdateRole = (req, res, next) => {
    if (req.userType != 'admin') {
        const error = new Error('Permission denied.');
        error.statusCode = 403;
        throw error;
    }
    const roleId = req.params.roleId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }

    const update = req.body
    // console.log(update)
    Role.findById(roleId)
        .then(role => {
            if (!role) {
                const error = new Error('Could not find.');
                error.statusCode = 404;
                throw error;
            }
            return Role.findByIdAndUpdate(roleId, update, { new: true })
        })
        .then(result => {
            res.status(200).json({ message: 'Updated!', role: result })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err);
        })
}

module.exports = {
    CreateRole,
    GetRoles,
    GetRole,
    UpdateRole,
}