const { validationResult } = require('express-validator/check')
const {
    moveFile
} = require('./upload')
const Big = require('big.js')
const moment = require("moment")
const Product = require('../models/product')
const OrderProduct = require('../models/orderProduct')
const ProductSummaries = require('../models/productSummaries')

const CreateProduct = (req, res, next) => {
    const errors = validationResult(req);
    if (req.userType == 2) {
        const accountId = req.userId
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed, entered data is incorrect.');
            error.statusCode = 422;
            throw error;
        }
        req.body.account = accountId
        if (req.body.productCover) {
            let newPath = `files/${accountId}`
            let newFile = moveFile('./' + req.body.productCover, `./${newPath}`)

            req.body.productCover = `${newPath}/${newFile}`
        }
        if (req.body.otherFiles) {
            let move = []
            for (let i of req.body.otherFiles) {

                let newPath = `files/${accountId}`
                let newFile = moveFile('./' + i, `./${newPath}`)
                move.push(`${newPath}/${newFile}`)
            }
            req.body.otherFiles = move
        }
        if (req.body.files) {
            let move = []
            for (let i of req.body.files) {

                let newPath = `files/${accountId}`
                let newFile = moveFile('./' + i.filePath, `./${newPath}`)
                move.push({
                    fileType: i.fileType,
                    filePath: `${newPath}/${newFile}`
                })
            }
            req.body.files = move
        }

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
    const perPage = 30;
    let totalItems;
    Product.find(query)
        .countDocuments()
        .then(count => {
            totalItems = count;
            return Product.find(query)
                .populate("account")
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
        .populate("account")
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

    if (req.userType != 1) {
        let accountId = req.userId
        const productId = req.params.productId;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed, entered data is incorrect.');
            error.statusCode = 422;
            throw error;
        }
        if (req.body.productCover) {
            let newPath = `files/${accountId}`
            let newFile = moveFile('./' + req.body.productCover, `./${newPath}`)

            req.body.productCover = `${newPath}/${newFile}`
        }
        if (req.body.otherFiles) {
            let move = []
            for (let i of req.body.otherFiles) {

                let newPath = `files/${accountId}`
                let newFile = moveFile('./' + i, `./${newPath}`)
                move.push(`${newPath}/${newFile}`)
            }
            req.body.otherFiles = move
        }
        if (req.body.update.files) {
            let move = []
            for (let i of req.body.update.files) {

                let newPath = `files/${accountId}`
                let newFile = moveFile('./' + i.fileType, `./${newPath}`)
                move.push({
                    fileType: i.fileType,
                    filePath: `${newPath}/${newFile}`
                })
            }
            req.body.update.files = move
        }

        const update = req.body.update

        // console.log(update)
        Product.findById(productId)
            .then(product => {
                if (!product) {
                    const error = new Error('Could not find.');
                    error.statusCode = 404;
                    throw error;
                }
                console.log(accountId)
                console.log(product.account.toString())
                if (req.userType == 2 && accountId !== product.account.toString()) {
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


const UpdateProductSummaries = (req, res, next) => {

    if (req.userType == 'admin') {
        let accountId = req.userId
        const productSummaryId = req.params.productSummaryId;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed, entered data is incorrect.');
            error.statusCode = 422;
            throw error;
        }

        const update = req.body.update

        // console.log(update)
        ProductSummaries.findById(productSummaryId)
            .then(product => {
                if (!product) {
                    const error = new Error('Could not find.');
                    error.statusCode = 404;
                    throw error;
                }

                if (update.paymentStatus && update.paymentStatus == 2) {
                    let paymentTranferDate = Date.now()
                    update.paymentTranferDate = paymentTranferDate

                }

                return ProductSummaries.findByIdAndUpdate(productSummaryId, update, { new: true })
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

const GetProductSummaries = async (req, res, next) => {

    await createProductSummaries()

    let query = {}
    if (req.userType && req.userType == 2) {
        query.account = req.userId
    }
    const currentPage = req.query.page || 1;
    const perPage = 30;
    let totalItems;
    ProductSummaries.find(query)
        .countDocuments()
        .then(count => {
            totalItems = count;
            return ProductSummaries.find(query)
                .populate("account")
                .populate("product")
                .populate("order")
                .skip((currentPage - 1) * perPage)
                .limit(perPage);
        })
        .then(productSummaries => {
            res.status(200).json({
                message: 'Fetched successfully.',
                productSummaries: productSummaries.map(i => {
                    return {
                        ...i._doc,
                        summaryNumber: `AC-${i.summaryNumber}`,
                        summaryMonth: moment(i.summaryMonth).endOf('month').format("YYYY-MM-DD") + " - " + moment(i.summaryMonth).format("YYYY-MM-01")

                    }
                }),
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

const createProductSummaries = async () => {
    let month = moment().format("M")
    const orderProduct = await OrderProduct.aggregate([
        {
            $match: {
                createSummary: false,
                orderStatus: 2
            }
        },
        {
            '$lookup': {
                'from': 'products',
                'localField': 'product',
                'foreignField': '_id',
                'as': 'product'
            }
        },
        {
            $project: {
                'product': {
                    '$arrayElemAt': [
                        '$product._id', 0
                    ]
                },
                'account': {
                    '$arrayElemAt': [
                        '$product.account', 0
                    ]
                },
                price: 1,
                discount: 1,
                total: 1,
                order: 1, orderCompletetDate: 1, "month": { $month: '$orderCompletetDate' }
            }
        },
        {
            $match: {
                month: parseInt(month)
            }
        },
    ]);
    // console.log(orderProduct)
    // return orderProduct
    let g = null
    let number = 1
    const getNumber = await ProductSummaries.findOne({})
        .sort({ createAt: -1 })
    if (getNumber) {
        number = parseInt(getNumber.summaryNumber) + 1
    }
    if (orderProduct.length > 0) {
        g = groupBy(orderProduct, 'account')

        for (let k in g) {

            let obj = {}
            let product = []
            let order = []
            let price = new Big(0)
            let totalDiscount = new Big(0)
            let totalPrice = new Big(0)
            let id = []
            for (let i of g[k]) {
                id.push(i._id)
                product.push(i.product)
                order.push(i.order)
                price = totalPrice.plus(Number(i.price))
                totalDiscount = totalPrice.plus(Number(i.discount))
                totalPrice = totalPrice.plus(Number(i.total))

            }
            obj.account = k
            obj.summaryNumber = zeroFill(number, 4)
            obj.product = product
            obj.order = order
            obj.price = price.toFixed(2)
            obj.discount = totalDiscount.toFixed(2)
            obj.total = totalPrice.toFixed(2)
            obj.paymentStatus = 1
            obj.summaryMonth = moment().format("YYYY-MM")
            console.log(obj)
            let productSummaries = new ProductSummaries(obj)
            await productSummaries.save()
            await OrderProduct.updateMany({
                _id: { $in: id }
            }, {
                createSummary: true
            })
            number++
        }

    }


    return g

}

const groupBy = (array, key) => {
    return array.reduce((result, currentValue) => {
        let value = Array.isArray(key) ? key.reduce((val, item) => val += currentValue[item], '') : currentValue[key];
        (result[value] = result[value] || []).push(currentValue);
        return result;
    }, {});
}

const zeroFill = (number, width) => {
    width -= number.toString().length;
    if (width > 0) {
        return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
    }
    return number + ""; // always return a string
};

module.exports = {
    CreateProduct,
    GetProducts,
    GetProduct,
    UpdateProduct,
    GetProductSummaries,
    UpdateProductSummaries
}