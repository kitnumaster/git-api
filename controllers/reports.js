const Order = require('../models/order')

const ReportOrders = async (req, res, next) => {


    let query = {}

    if (req.query.paymentStatus) {
        query.paymentStatus = req.query.paymentStatus
    }
    if (req.query.paymentMethod) {
        query.paymentMethod = req.query.paymentMethod
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
    let dataDate2 = null
    if (req.query.paymentCompleteDate) {
        dataDate2 = req.query.paymentCompleteDate.split(":")
        date = moment(dataDate2[0]).subtract(7, 'hours').format("YYYY-MM-DD")
        date2 = moment(dataDate2[1]).format("YYYY-MM-DD")
        query.paymentCompleteDate = {
            $gte: new Date(`${date} 17:00:00`),
            $lte: new Date(`${date2} 16:59:59`)
        }
    }

    const orders = await Order.aggregate([
        {
            $match: query
        },
        {
            '$lookup': {
                'from': 'accounts',
                'localField': 'account',
                'foreignField': '_id',
                'as': 'customer'
            }
        },
        {
            '$lookup': {
                'from': 'products',
                'localField': 'paymentDetail.product',
                'foreignField': '_id',
                'as': 'products'
            }
        },
        {
            '$lookup': {
                'from': 'accounts',
                'localField': 'products.account',
                'foreignField': '_id',
                'as': 'designer'
            }
        },
        {
            $project: {
                'orderNumber': 1,
                'customerFirstName': {
                    '$arrayElemAt': [
                        '$customer.firstName', 0
                    ]
                },
                'customerLastName': {
                    '$arrayElemAt': [
                        '$customer.lastName', 0
                    ]
                },
                'createdAt': 1,
                'paymentStatus': 1,
                'paymentMethod': 1,
                'paymentCompleteDate': 1,
                'paymentSlip': 1,
                'totalDiscount': 1,
                'totalPrice': 1,
                'products._id': 1,
                'products.productName': 1,
                'products.account': 1,
                'paymentDetail.account': 1,
                'paymentDetail.product': 1,
                'paymentDetail.discount': 1,
                'paymentDetail.price': 1,
                'paymentDetail.total': 1,
                'designer._id': 1,
                'designer.firstName': 1,
                'designer.lastName': 1
            }
        }
    ]).then(orders => {

        let result = []

        let n = 1
        for (let i of orders) {
            // console.log(i.designer)
            for (let j of i.products) {
                // console.log(i)
                let productFound = i.paymentDetail.find(element => element.product.toString() == j._id.toString())
                // console.log(j._id + " = " + productFound.product)
                let product = productFound
                let disignerFound = i.designer.find(element => element._id.toString() == j.account.toString())
                // console.log(i.designer)
                // console.log(disignerFound)
                // console.log(j.account + " = " + disignerFound._id)
                result.push({
                    No: n,
                    orderNumber: `OD-${i.orderNumber}`,
                    customer: `${i.customerFirstName} ${i.customerLastName}`,
                    createdAt: i.createdAt,
                    paymentStatus: i.paymentStatus,
                    paymentMethod: i.paymentMethod,
                    paymentCompleteDate: i.paymentCompleteDate,
                    paymentSlip: i.paymentSlip,
                    totalPrice: i.totalPrice,
                    totalDiscount: i.totalDiscount,
                    productName: j.productName,
                    designer: `${disignerFound.firstName} ${disignerFound.lastName}`,
                    price: product.price,
                    discount: product.discount,
                    total: product.total,
                })
            }

            n++
        }

        res.status(200).json({
            message: 'Fetched successfully.',
            // raw: orders,
            orders: result
        });
    })

}

module.exports = {
    ReportOrders
}