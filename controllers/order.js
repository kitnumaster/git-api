const { validationResult } = require('express-validator/check')
const Order = require('../models/order')
const OrderProduct = require('../models/orderProduct')
const Product = require('../models/product')
const Account = require('../models/account')
const Big = require('big.js');
const ProductDownloadLog = require('../models/log/productDownloadLog');
const FileType = require('../models/setting/file-type');
const emailCtr = require('./email')

const zeroFill = (number, width) => {
    width -= number.toString().length;
    if (width > 0) {
        return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
    }
    return number + ""; // always return a string
};

const buildOrder = async (productId, promotionCode) => {

    const product = await Product.find({
        _id: {
            $in: productId
        }
    })

    let paymentDetail = []
    let totalDiscount = new Big(0)
    let totalPrice = new Big(0)
    for (let i of product) {

        let price = new Big(i.price)
        paymentDetail.push({
            account: i.account,
            product: i._id,
            price: i.price,
            discount: i.discount,
            total: price.minus(i.discount).toFixed(2)
        })
        totalDiscount = totalDiscount.plus(Number(i.discount))
        totalPrice = totalPrice.plus(Number(i.price))
    }

    return {
        paymentDetail,
        totalDiscount,
        totalPrice
    }

}

const CreateOrder = async (req, res, next) => {
    const errors = validationResult(req);
    if (req.UserType != 'admin') {
        const accountId = req.userId
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed, entered data is incorrect.');
            error.statusCode = 422;
            throw error;
        }
        req.body.account = accountId
        const body = req.body
        let productDetail = await buildOrder(body.product)
        body.orderStatus = 1
        if (body.paymentMethod == 1) {
            body.orderStatus = 1
            body.paymentStatus = 1
        } else if (body.paymentMethod == 2) {
            //check card
            body.orderStatus = 2
            body.paymentStatus = 3
        }
        body.paymentDetail = productDetail.paymentDetail
        body.totalDiscount = productDetail.totalDiscount.toFixed(2)
        body.totalPrice = productDetail.totalPrice.toFixed(2)
        console.log(body)

        // res.status(201).json({
        //     message: 'Created successfully!',
        //     product: productDetail
        // });
        let orderNumber = 1
        const getNumber = await Order.findOne({})
            .sort({ createdAt: -1 })
        // console.log(getNumber)
        if (getNumber) {
            orderNumber = parseInt(getNumber.orderNumber) + 1
        }

        body.orderNumber = zeroFill(orderNumber, 4)

        const order = new Order(body)
        order
            .save()
            .then(async result => {

                //send email
                let getMailAccount = await Account.findById(accountId, {
                    email: 1
                })
                emailCtr.NewOrder(getMailAccount.email)

                for (let i of order.paymentDetail) {
                    let orderP = new OrderProduct({
                        account: i.account,
                        product: i.product,
                        price: i.price,
                        discount: i.discount,
                        total: i.total,
                        order: order._id,
                        paymentStatus: 1
                    })
                    await orderP.save()
                }

                res.status(201).json({
                    message: 'Created successfully!',
                    product: order
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

const GetOrders = (req, res, next) => {
    let noFile = null
    let query = {}
    if (req.userType != "admin") {
        query.account = req.userId
        noFile = { files: 0 }
    }

    if (req.query.paymentStatus) {
        query.paymentStatus = req.query.paymentStatus
    }

    if (req.query.orderNumber) {
        query.orderNumber = req.query.orderNumber.replace('OD-', '')
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
    // console.log(query)
    const currentPage = req.query.page || 1;
    const perPage = 30;
    let totalItems;
    Order.find(query)
        .countDocuments()
        .then(count => {
            totalItems = count;
            return Order.find(query)
                .populate("account", {
                    password: 0
                })
                .populate("paymentDetail.product", noFile)
                .populate("paymentDetail.account", {
                    firstName: 1,
                    lastName: 1
                })
                .sort(sort)
                .skip((currentPage - 1) * perPage)
                .limit(perPage);
        })
        .then(async orders => {

            for (let i of orders) {
                // 
                for (let l of i.paymentDetail) {
                    // console.log(l.product.fileType)
                    let fileType = await FileType.find({
                        _id: {
                            $in: l.product.fileType
                        }
                    })
                    l.product.fileType = fileType
                }
            }

            res.status(200).json({
                message: 'Fetched successfully.',
                orders: orders.map(i => {
                    return {
                        ...i._doc,
                        orderNumber: `OD-${i.orderNumber}`,
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

const GetOrder = (req, res, next) => {

    const orderId = req.params.orderId
    let noFile = null
    if (req.userType != "admin") {
        // query.account = req.userId
        noFile = { files: 0 }
    }
    Order.findById(orderId)
        .populate("account", {
            password: 0
        })
        .populate("paymentDetail.product", noFile)
        .populate("paymentDetail.account", { password: 0 })
        .then(async order => {
            if (!order) {
                const error = new Error('Could not find.');
                error.statusCode = 404;
                throw error;
            }

            let detail = []

            for (let i = 0; i < order.paymentDetail.length; i++) {

                let p = await Product.findOne({
                    _id: order.paymentDetail[i].product._id
                }, {
                    "material": 1,
                    "housing": 1,
                    "trendName": 1,
                    "fileTypeName": 1,
                    "jewerlyTypeName": 1,
                    "detailName": 1,
                    "setName": 1,
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

                order.paymentDetail[i].product.material = p.material
                order.paymentDetail[i].product.housing = p.housing
                order.paymentDetail[i].product.trend = p.trend
                order.paymentDetail[i].product.fileType = p.fileType
                order.paymentDetail[i].product.jewerlyType = p.jewerlyType
                order.paymentDetail[i].product.detail = p.detail
                order.paymentDetail[i].product.set = p.set
            }

            res.status(200).json({
                message: 'fetched.', order: {
                    ...order._doc,
                    orderNumber: `OD-${order.orderNumber}`
                }
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

const DeleteOrder = (req, res, next) => {
    const orderId = req.params.orderId
    let query = {
        _id: orderId
    }
    if (req.userType && req.userType != 'admin') {
        query.account = req.userId
    }
    Order.findOne(query)
        .then(order => {
            if (!order) {
                const error = new Error('Could not find.');
                error.statusCode = 404;
                throw error;
            }
            // console.log(order._id)
            return Order.findByIdAndRemove(order._id);
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

const UpdateOrder = (req, res, next) => {
    const orderId = req.params.orderId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }

    const update = req.body.update
    Order.findById(orderId)
        .then(async order => {
            if (!order) {
                const error = new Error('Could not find.');
                error.statusCode = 404;
                throw error;
            }

            if (update.paymentStatus == 2) {
                //send email
                let getMailAccount = await Account.findById(order.account, {
                    email: 1
                })
                emailCtr.OrderTranfer(getMailAccount.email)
            }

            if (update.paymentStatus && update.paymentStatus == 3) {
                let paymentCompleteDate = Date.now()
                update.paymentCompleteDate = paymentCompleteDate
                let a = await OrderProduct.updateMany(
                    {
                        order: orderId
                    }, {
                    orderStatus: 2,
                    orderCompletetDate: paymentCompleteDate
                })
                let productId = []
                for (let i of order.paymentDetail) {
                    productId.push(i.product)
                }
                // console.log(productId)
                await Product.updateMany(
                    {
                        _id: {
                            $in: productId
                        }
                    }, {
                    sold: true,
                })

                //send email
                let getMailAccount = await Account.findById(order.account, {
                    email: 1
                })
                emailCtr.ApproveOrderTranfer(getMailAccount.email)
            }

            return Order.findByIdAndUpdate(orderId, update, { new: true })
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
}

const GetOrderProductOrders = async (req, res, next) => {

    let query = {
        orderStatus: 2
    }
    if (req.userType != "admin") {
        query.account = req.userId
    }

    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;
    OrderProduct.find(query)
        .countDocuments()
        .then(count => {
            // console.log(count)
            totalItems = count;
            return OrderProduct.find(query)
                .populate("account")
                .populate("order", {
                    orderNumber: 1,
                })
                .populate("product", {
                    files: 0,
                })
                .skip((currentPage - 1) * perPage)
                .limit(perPage);
        })
        .then(orderProducts => {
            res.status(200).json({
                message: 'Fetched successfully.',
                orderProducts: orderProducts.map(i => {
                    // console.log(i.order.orderNumber)
                    return {
                        ...i._doc,
                        order: {
                            _id: i.order._id,
                            orderNumber: `OD-${i.order.orderNumber}`
                        }
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

const DownloadProduct = (req, res, next) => {
    const productId = req.params.productId
    let query = {
        'paymentDetail.product': productId
    }
    if (req.userType != "admin") {
        query.account = req.userId
    }
    console.log(query)
    Order.find(query)
        .then(orders => {
            console.log(orders)
            if (orders.length > 0) {
                // console.log('orders')
                AddProductDownloadLog(req.userId || null, productId, req.ipAddresses || null)
                return Product.findById(productId, {
                    files: 1
                })

            }
        })
        .then(product => {
            res.status(200).json({
                product: product
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })

}

const AddProductDownloadLog = async (account, productId, IP) => {
    // console.log('ok')
    let obj = {
        account: account,
        product: productId,
        IP: IP
    }
    // console.log(obj)
    const productDownloadLog = new ProductDownloadLog(obj)

    await productDownloadLog.save()
        .then(result => {


        })

}

module.exports = {
    CreateOrder,
    GetOrders,
    DeleteOrder,
    GetOrder,
    UpdateOrder,
    GetOrderProductOrders,
    DownloadProduct
}