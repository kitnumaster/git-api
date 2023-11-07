const { validationResult } = require('express-validator/check')
const Cart = require('../models/cart')
const Product = require('../models/product')
const Account = require('../models/account')
const Big = require('big.js');


const CreateCart = async (req, res, next) => {
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
        // console.log(req.body.product)
        const product = await Product.findById(req.body.product)
        // console.log(product)
        let price = new Big(product.price)
        body.discount = product.discount ? product.discount.toFixed(2) : 0.00
        body.price = price.plus(body.discount).toFixed(2)
        body.total = price.toFixed(2)
        Cart.findOne({
            account: accountId,
            product: req.body.product
        })
            .then(cart => {
                if (!cart) {
                    // console.log('add')
                    const cart = new Cart(body)
                    return cart.save()
                } else {
                    return Cart.findByIdAndUpdate(cart._id, body, { new: true })
                }
            })
            .then(result => {
                res.status(200).json({ message: 'Updated!', cart: result })
            })
            .catch(err => {
                if (!err.statusCode) {
                    err.statusCode = 500
                }
                next(err)
            })
    } else {
        const error = new Error('Permission denied.');
        error.statusCode = 403;
        throw error;
    }
}

const GetCarts = (req, res, next) => {

    let query = {}
    if (req.userType && req.userType != 'admin') {
        query.account = req.userId
    }
    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;
    let totalDiscount = new Big(0)
    let totalPrice = new Big(0)
    Cart.find(query)
        .countDocuments()
        .then(async count => {
            totalItems = count;
            let list = await Cart.find(query)
                .populate("product")
            let newList = []
            for (let i of list) {
                let designer = await Account.findOne({
                    _id: i.product.account
                }, {
                    firstName: 1,
                    lastName: 1
                })
                totalDiscount = totalDiscount.plus(Number(i.product.discount))
                totalPrice = totalPrice.plus(Number(i.product.price))
                newList.push({
                    ...i._doc,
                    designer: {
                        firstName: designer.firstName,
                        lastName: designer.lastName
                    }
                })
            }
            return newList
        })
        .then(carts => {
            res.status(200).json({
                message: 'Fetched successfully.',
                carts: carts,
                totalDiscount: Number(totalDiscount.toFixed(2)),
                totalPrice: Number(totalPrice.toFixed(2)),
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

const DeleteCart = (req, res, next) => {
    const productId = req.params.productId
    let query = {
        product: productId
    }
    if (req.userType && req.userType != 'admin') {
        query.account = req.userId
    }
    Cart.findOne(query)
        .then(cart => {
            if (!cart) {
                const error = new Error('Could not find.');
                error.statusCode = 404;
                throw error;
            }
            // console.log(cart._id)
            return Cart.findByIdAndRemove(cart._id);
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

module.exports = {
    CreateCart,
    GetCarts,
    DeleteCart,
}