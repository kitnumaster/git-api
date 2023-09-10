const { validationResult } = require('express-validator/check')
const Product = require('../models/product')

const CreateProduct = (req, res, next) => {
    const errors = validationResult(req);
    if (req.userType == 2) {
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed, entered data is incorrect.');
            error.statusCode = 422;
            throw error;
        }
        req.body.account = req.userId
        const body = req.body
        // console.log(body)
        const product = new Product(body)
        product
            .save()
            .then(result => {
                res.status(201).json({
                    message: 'Created successfully!',
                    product: product
                });
            })
            .catch(err => {
                if (!err.statusCode) {
                    err.statusCode = 500
                }
                next(err)
            });
    } else {
        const error = new Error('Permission denied.');
        error.statusCode = 403;
        throw error;
    }
}

const GetProducts = (req, res, next) => {

    let query = {}
    if (req.userType && req.userType == 2) {
        query.account = req.userId
    }
    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;
    Product.find(query)
        .countDocuments()
        .then(count => {
            totalItems = count;
            return Product.find(query)
                .populate("material", {
                    materialName: 1,
                })
                .populate("housing", {
                    housingName: 1,
                })
                .populate("trend", {
                    trendName: 1,
                })
                .populate("fileType", {
                    fileTypeName: 1,
                })
                .populate("jewerlyType", {
                    jewerlyTypeName: 1,
                })
                .populate("detail", {
                    detailName: 1,
                })
                .populate("set", {
                    setName: 1,
                })
                .skip((currentPage - 1) * perPage)
                .limit(perPage);
        })
        .then(products => {
            res.status(200).json({
                message: 'Fetched successfully.',
                products: products,
                totalItems: totalItems,
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

const GetProduct = (req, res, next) => {
    const productId = req.params.productId
    Product.findById(productId)
        .populate("material", {
            materialName: 1,
        })
        .populate("housing", {
            housingName: 1,
        })
        .populate("trend", {
            trendName: 1,
        })
        .populate("fileType", {
            fileTypeName: 1,
        })
        .populate("jewerlyType", {
            jewerlyTypeName: 1,
        })
        .populate("detail", {
            detailName: 1,
        })
        .populate("set", {
            setName: 1,
        })
        .then(product => {
            if (!product) {
                const error = new Error('Could not find.');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({ message: 'fetched.', product: product })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

const UpdateProduct = (req, res, next) => {

    if (req.userType == 2) {
        let accountId = req.userId
        const productId = req.params.productId;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed, entered data is incorrect.');
            error.statusCode = 422;
            throw error;
        }

        const update = req.body.update
        Product.findById(productId)
            .then(product => {
                if (!product) {
                    const error = new Error('Could not find.');
                    error.statusCode = 404;
                    throw error;
                }
                console.log(accountId)
                console.log(product.account.toString())
                if (accountId !== product.account.toString()) {
                    const error = new Error('Permission denied.');
                    error.statusCode = 403;
                    throw error;
                }

                return Product.findByIdAndUpdate(productId, update, { new: true })
            })
            .then(result => {
                res.status(200).json({ message: 'Updated!', product: result })
            })
            .catch(err => {
                if (!err.statusCode) {
                    err.statusCode = 500
                }
                next(err);
            })
    } else {
        const error = new Error('Permission denied.');
        error.statusCode = 403;
        throw error;
    }
}

module.exports = {
    CreateProduct,
    GetProducts,
    GetProduct,
    UpdateProduct,
}