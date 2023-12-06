const { validationResult } = require('express-validator/check')
const {
    moveFile
} = require('./upload')
const Big = require('big.js')
const moment = require("moment")
const Product = require('../models/product')
const OrderProduct = require('../models/orderProduct')
const ProductSummaries = require('../models/productSummaries')
const ProductViewLog = require('../models/log/productViewLog')
const Designer = require('../models/account')
const ProductFavorite = require('../models/product-favorite')
const Account = require('../models/account')
const emailCtr = require('./email')

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
    let sort = {
        createdAt: -1
    }
    if (req.query.sortBy) {
        let sortBy = req.query.sortBy
        sort = {
            [sortBy]: req.query.sortType || -1
        }
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
                .sort(sort)
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

const UserGetProducts = (req, res, next) => {

    let query = {
        sold: false
    }

    if (req.userType && req.userType == 'admin') {
        query = {}
    }
    if (req.userType && req.userType == 2) {
        query.account = req.userId
    }

    if (req.query.designer) {
        query.account = req.query.designer
    }
    if (req.query.productName) {
        query.productName = req.query.productName
    }
    if (req.query.productNameTH) {
        query.productNameTH = req.query.productNameTH
    }
    if (req.query.sold) {
        query.sold = req.query.sold
    }
    if (req.query.active) {
        query.active = req.query.active
    }
    if (req.query.material) {
        query.material = req.query.material
    }
    if (req.query.housing) {
        query.housing = req.query.housing
    }
    if (req.query.trend) {
        query.trend = req.query.trend
    }
    if (req.query.fileType) {
        query.fileType = req.query.fileType
    }
    if (req.query.jewerlyType) {
        query.jewerlyType = req.query.jewerlyType
    }
    if (req.query.price) {
        let priceRang = req.query.price.split(":")
        query.price = {
            $gte: priceRang[0],
            $lte: priceRang[1]
        }
    }
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
                .sort(sort)
                .skip((currentPage - 1) * perPage)
                .limit(perPage);
        })
        .then(products => {
            res.status(200).json({
                message: 'Fetched successfully.',
                products: products.map(i => {
                    let files = null
                    // console.log(i.account._id)
                    // console.log(req.userId)
                    if (req.userType && req.userType == 'admin') {
                        files = i.files
                    } else if (req.userId && req.userId == i.account._id) {
                        files = i.files
                    }

                    return {
                        ...i._doc,
                        files: files
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

const UserGetProductsHomepage = async (req, res, next) => {

    let newProducts = await Product.find({ sold: false, active: true })
        .populate("account", {
            firstName: 1,
            lastName: 1
        })
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
        .sort({ createdAt: -1 })
        .skip(1)
        .limit(8)

    let viewProducts = await Product.find({ sold: false, active: true })
        .populate("account", {
            firstName: 1,
            lastName: 1
        })
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
        .sort({ views: -1 })
        .skip(1)
        .limit(4)

    let discountProducts = await Product.find({ sold: false, active: true, discount: { $exists: true }, discount: { $ne: 0 } })
        .populate("account", {
            firstName: 1,
            lastName: 1
        })
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
        .sort({ createdAt: -1 })
        .skip(1)
        .limit(4)

    const hotProducts = []

    const designer = await Designer.find({ userType: 2 }, {
        _id: 1
    })
        .sort({ views: -1 })
        .skip(1)
        .limit(4)

    for (let i of designer) {

        let hot = await Product.findOne({ sold: false, active: true, account: i._id })
            .populate("account", {
                firstName: 1,
                lastName: 1
            })
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
            .sort({ views: -1 })

        hotProducts.push(hot)
    }


    res.status(200).json({
        message: 'Fetched successfully.',
        newProducts: newProducts,
        viewProducts: viewProducts,
        discountProducts: discountProducts,
        hotProducts: hotProducts
    });

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

const UserGetProduct = (req, res, next) => {
    // console.log(req.ipAddresses)
    // console.log(req.userId)
    const productId = req.params.productId
    Product.findById(productId)
        .populate("account")
        .populate("material", {
            materialName: 1,
            materialNameTH: 1,
        })
        .populate("housing", {
            housingName: 1,
            housingNameTH: 1,
        })
        .populate("trend", {
            trendName: 1,
            trendNameTH: 1,
        })
        .populate("fileType", {
            fileTypeName: 1,
            fileTypeNameTH: 1,
        })
        .populate("jewerlyType", {
            jewerlyTypeName: 1,
            jewerlyTypeNameTH: 1,
        })
        .populate("detail", {
            detailName: 1,
            detailNameTH: 1,
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

            req.userType == 'admin' ? null : AddProductViewLog(req.userId || null, productId, req.ipAddresses || null)

            let files = product.files;
            product.files = null

            // console.log(i.account._id)
            // console.log(req.userId)

            if (req.userType && req.userType == 'admin') {
                product.files = files
            } else if (req.userId && req.userId == product.account._id) {
                product.files = files
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
                let newFile = moveFile('./' + i.filePath, `./${newPath}`)
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
            .then(async product => {
                if (!product) {
                    const error = new Error('Could not find.');
                    error.statusCode = 404;
                    throw error;
                }

                if (update.paymentStatus && update.paymentStatus == 2) {
                    //     let paymentTranferDate = Date.now()
                    //     update.paymentTranferDate = paymentTranferDate
                    await OrderProduct.updateMany({
                        order: { $in: product.order }
                    }, {
                        paymentStatus: 2
                    })

                    //send email
                    let getMailAccount = await Account.findById(product.account, {
                        email: 1,
                        firstName: 1,
                        lastName: 1,
                        userName: 1
                    })
                    let summaryNumber = `AC-${product.summaryNumber}`
                    let orderRang = product.summaryMonth
                    let userFullname = getMailAccount.firstName && getMailAccount.lastName ? `${getMailAccount.firstName} ${getMailAccount.lastName}` : getMailAccount.userName
                    let paymentDate = moment(product.paymentTranferDate).format('DD-MMM-YY HH:mm')
                    let paymentAmount = update.transferAmount ? update.transferAmount : product.transferAmount
                    emailCtr.ApproveDesignerOrderTranfer(getMailAccount.email, userFullname, summaryNumber, orderRang, paymentDate, paymentAmount)
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

    // await createProductSummaries()

    let query = {}
    if (req.userType && req.userType == 2) {
        query.account = req.userId
    }
    if (req.query.summaryNumber) {
        query.summaryNumber = req.query.summaryNumber
    }
    if (req.query._id) {
        query._id = req.query._id
    }
    if (req.query.paymentStatus) {
        query.paymentStatus = req.query.paymentStatus
    }
    if (req.query.summaryMonth) {
        query.summaryMonth = req.query.summaryMonth
    }
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
    const currentPage = req.query.page || 1;
    const perPage = 30;
    let totalItems;
    ProductSummaries.find(query)
        .countDocuments()
        .then(count => {
            totalItems = count;
            return ProductSummaries.find(query)
                .populate("account")
                .populate("products.product")
                .populate("products.order")
                .sort(sort)
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

const CreateProductSummariesManual = (req, res, next) => {
    const errors = validationResult(req);
    // console.log(req.userType)
    if (req.userType == 'admin') {
        req.body.summaryMonth
        createProductSummaries(req.body.month || null, req.body.year || null)
        res.status(200).json({
            message: 'Successfully.',
        });
    } else {
        const error = new Error('Permission denied.');
        error.statusCode = 403;
        throw error;
    }
}

const createProductSummaries = async (month, year) => {
    month = month || moment().format("M")
    year = year || moment().format("YYYY")
    // month = "9"
    // console.log(parseInt(month), " ", parseInt(year))
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
                order: 1,
                orderCompletetDate: 1,
                "month": { $month: '$orderCompletetDate' },
                "year": { $year: "$orderCompletetDate" },
            }
        },
        {
            $match: {
                month: parseInt(month),
                year: parseInt(year)
            }
        },
    ]);
    // console.log(orderProduct)
    // return orderProduct

    let g = null
    let number = 1
    const getNumber = await ProductSummaries.findOne({})
        .sort({ createdAt: -1 })
    if (getNumber) {
        number = parseInt(getNumber.summaryNumber) + 1
    }
    if (orderProduct.length > 0) {
        g = groupBy(orderProduct, 'account')

        for (let k in g) {

            let obj = {}
            let products = []
            let price = new Big(0)
            let totalDiscount = new Big(0)
            let totalPrice = new Big(0)
            let id = []
            for (let i of g[k]) {
                // console.log(i)
                id.push(i._id)
                products.push({
                    order: i.order,
                    product: i.product
                })
                price = price.plus(Number(i.price))
                totalDiscount = totalDiscount.plus(Number(i.discount))
                totalPrice = totalPrice.plus(Number(i.total))

            }
            obj.account = k
            obj.summaryNumber = zeroFill(number, 4)
            obj.products = products
            obj.price = price.toFixed(2)
            obj.discount = totalDiscount.toFixed(2)
            obj.total = totalPrice.toFixed(2)
            obj.paymentStatus = 1
            obj.summaryMonth = moment().format("YYYY-MM")
            // console.log(obj)
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

const AddProductViewLog = async (account, productId, IP) => {
    // console.log('ok')
    let obj = {
        account: account,
        product: productId,
        IP: IP
    }
    // console.log(obj)
    const productViewLog = new ProductViewLog(obj)

    await productViewLog.save()
        .then(result => {

            //add view
            Product.findById(productId, {
                views: 1
            })
                .then(async product => {
                    console.log(product)
                    await Product.findByIdAndUpdate(productId, {
                        views: product.views + 1
                    }, { new: true })


                })

        })

}

const AddProductFavorite = (req, res, next) => {
    console.log(req.body)
    const account = req.userId
    const product = req.body.product

    ProductFavorite.findOne({
        account: account,
        product: product
    })
        .then(async productFavorite => {
            if (!productFavorite) {

                const productFav = new ProductFavorite({
                    account: account,
                    product: product
                })
                await productFav
                    .save()

            }
            res.status(200).json({
                message: 'Successfully.',
            })
        })


}

const DeleteProductFavorite = (req, res, next) => {

    const account = req.userId
    const product = req.params.productId

    ProductFavorite.findOne({
        account: account,
        product: product
    })
        .then(async productFavorite => {
            // console.log(productFavorite)
            if (productFavorite) {
                await ProductFavorite.findByIdAndRemove(productFavorite._id);
            }

            return true
        })
        .then(result => {
            // console.log(result);
            res.status(200).json({ message: 'Deleted.' });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });


}

const GetProductFavorites = (req, res, next) => {

    let query = {}
    if (req.userType && req.userType == 2) {
        query.account = req.userId
    }
    const currentPage = req.query.page || 1;
    const perPage = 30;
    let totalItems;
    ProductFavorite.find(query)
        .countDocuments()
        .then(count => {
            totalItems = count;
            return ProductFavorite.find(query)
                .populate("account", {
                    password: 0
                })
                .populate("product")
                .skip((currentPage - 1) * perPage)
                .limit(perPage);
        })
        .then(productFavorites => {
            res.status(200).json({
                message: 'Fetched successfully.',
                productFavorites: productFavorites,
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

module.exports = {
    CreateProduct,
    GetProducts,
    GetProduct,
    UpdateProduct,
    GetProductSummaries,
    UpdateProductSummaries,
    UserGetProducts,
    UserGetProduct,
    CreateProductSummariesManual,
    UserGetProductsHomepage,
    AddProductFavorite,
    DeleteProductFavorite,
    GetProductFavorites,
}