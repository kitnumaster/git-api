const { validationResult } = require('express-validator/check')
const moment = require('moment')
const Order = require('../models/order')

const DashboardOrder = async (req, res, next) => {
    let query = {}
    let dataDate = null
    if (req.query.paymentCompleteDate) {
        dataDate = req.query.paymentCompleteDate.split(":")
        date = moment(dataDate[0]).subtract(7, 'hours').format("YYYY-MM-DD")
        date2 = moment(dataDate[1]).format("YYYY-MM-DD")
        query.paymentCompleteDate = {
            $gte: new Date(`${date} 17:00:00`),
            $lte: new Date(`${date2} 16:59:59`)
        }
    }
    let sort = {
        paymentCompleteDate: -1
    }
    if (req.query.sortBy) {
        let sortBy = req.query.sortBy
        sort = {
            [sortBy]: req.query.sortType || -1
        }
    }
    let totalPrice = await Order.aggregate([
        {
            $match: query
        },
        {
            '$group': {
                '_id': null,
                'totalPrice': {
                    '$sum': '$totalPrice'
                }
            }
        }
    ])

    Order.find(query)
        .populate("account", {
            password: 0
        })
        .populate("paymentDetail.product", { files: 0 })
        .sort(sort)
        .then(orders => {
            res.status(200).json({
                message: 'Fetched successfully.',
                orders: orders.map(i => {
                    return {
                        ...i._doc,
                        orderNumber: `OD-${i.orderNumber}`,
                    }
                }),
                totalPrice: totalPrice.length > 0 ? totalPrice[0].totalPrice : 0
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
    DashboardOrder,
}