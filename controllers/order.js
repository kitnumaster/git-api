const { validationResult } = require('express-validator/check')
const Order = require('../models/order')
const Product = require('../models/product')
const Big = require('big.js');

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
            product: i._id,
            price: i.price,
            discount: i.discount,
            total: price.minus(i.discount).toFixed(2)
        })
        totalDiscount = totalPrice.plus(Number(i.discount))
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
        // console.log(body)

        // res.status(201).json({
        //     message: 'Created successfully!',
        //     product: productDetail
        // });
        const order = new Order(body)
        order
            .save()
            .then(result => {
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

    let query = {}
    if (req.userType != "admin") {
        query.account = req.userId
    }

    // console.log(query)
    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;
    Order.find(query)
        .countDocuments()
        .then(count => {
            totalItems = count;
            return Order.find(query)
                .populate("paymentDetail.product")
                .skip((currentPage - 1) * perPage)
                .limit(perPage);
        })
        .then(orders => {
            res.status(200).json({
                message: 'Fetched successfully.',
                products: orders,
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
    // if (req.userType != "admin") {
    //     query.account = req.userId
    // }
    Order.findById(orderId)
        .populate("paymentDetail.product")
        .then(order => {
            if (!order) {
                const error = new Error('Could not find.');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({ message: 'fetched.', order: order })
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
        .then(order => {
            if (!order) {
                const error = new Error('Could not find.');
                error.statusCode = 404;
                throw error;
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

module.exports = {
    CreateOrder,
    GetOrders,
    DeleteOrder,
    GetOrder,
    UpdateOrder,
}