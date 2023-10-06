const Order = require('../models/order')
const Account = require('../models/account')
const Product = require('../models/product')
const ProductSummaries = require('../models/productSummaries')
const moment = require('moment')
const Big = require('big.js');

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

    Order.aggregate([
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
                    no: n,
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

const ReportCustomers = async (req, res, next) => {

    let query = {}

    Account.find(query)
        .then(account => {
            let n = 0
            res.status(200).json({
                message: 'Fetched successfully.',
                orders: account.map(i => {

                    let registerDesigner = '-'
                    if (i.requestDesigner && i.userType == 1) {
                        registerDesigner = 'รออนุมัติ'
                    } else if (i.requestDesigner && i.userType == 2) {
                        registerDesigner = 'อนุมัติ'
                    }
                    n++
                    return {
                        no: n,
                        customerName: `${i.firstName} ${i.lastName}`,
                        email: i.email,
                        phone: i.phone,
                        createdAt: i.createdAt,
                        requestDesigner: registerDesigner,
                        status: i.status,
                        billAddress: i.billAddress,
                        id: i.id
                    }
                })
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })

}

const ReportDesigners = async (req, res, next) => {

    let query = {
        userType: 2
    }

    Account.aggregate([
        {
            $match: query
        },
        {
            '$lookup': {
                'from': 'products',
                'localField': '_id',
                'foreignField': 'account',
                'as': 'products'
            }
        },
        {
            '$lookup': {
                'from': 'productsummaries',
                'localField': '_id',
                'foreignField': 'account',
                'as': 'productSummaries'
            }
        },
        {
            $project: {
                'firstName': 1,
                'lastName': 1,
                'email': 1,
                'phone': 1,
                'createdAt': 1,
                'status': 1,
                'designerType': 1,
                'designerLevel': 1,
                'experience': 1,
                'id': 1,
                'billAddress': 1,
                'company': 1,
                'companyAddress': 1,
                'products._id': 1,
                'productSummaries': 1
            }
        }
    ]).then(account => {

        let result = []

        let n = 1
        for (let i of account) {

            let sales = new Big(0)
            let productSales = 0
            for (let j of i.productSummaries) {
                sales = sales.plus(j.total)
                productSales += j.product.length
            }

            result.push({
                no: n,
                customerName: `${i.firstName} ${i.lastName}`,
                email: i.email,
                phone: i.phone,
                createdAt: i.createdAt,
                status: i.status,
                designerType: i.designerType,
                designerLevel: i.designerLevel,
                experience: i.experience,
                id: i.id,
                billAddress: i.billAddress,
                company: i.company,
                companyAddress: i.companyAddress,
                sales: sales,
                totalProduct: i.products.length,
                totalProductSales: productSales
            })
            n++
        }

        res.status(200).json({
            message: 'Fetched successfully.',
            // raw: account,
            disigners: result
        });
    })

}

const ReportDesigns = async (req, res, next) => {

    let query = {}

    Product.find(query)
        .populate("account", {
            firstName: 1,
            lastName: 1
        })
        .populate("material", {
            _id: 0,
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
        .then(async products => {
            let n = 0
            let results = []
            for (let i of products) {

                n++
                let material = i.material ? i.material.map(m => {
                    return m.materialName
                }) : []
                let housing = i.housing ? i.housing.map(m => {
                    return m.housingName
                }) : []
                let trend = i.trend ? i.trend.map(m => {
                    return m.trendName
                }) : []

                let order = await Order.findOne({ paymentStatus: 3, 'paymentDetail.product': i._id }, { createdAt: -1 })
                    .sort({ createdAt: 1 })

                results.push({
                    no: n,
                    productNameTH: i.productNameTH,
                    productName: i.productName,
                    jewerlyType: i.jewerlyType ? i.jewerlyType.jewerlyTypeName : '-',
                    material: material.length > 0 ? material.join('/') : '-',
                    housing: housing.length > 0 ? housing.join('/') : '-',
                    trend: trend.length > 0 ? trend.join('/') : '-',
                    productDetailTH: i.productDetailTH,
                    productDetail: i.productDetail,
                    price: i.price,
                    price: i.price,
                    productCover: i.productCover,
                    otherFiles: i.otherFiles,
                    files: i.files,
                    designerName: `${i.account.firstName} ${i.account.lastName}`,
                    createdAt: i.createdAt,
                    soldDate: order ? order.createdAt : '-',
                    period: order ? moment(order.createdAt).diff(moment(i.createdAt), 'days') : '-',
                })
            }

            res.status(200).json({
                message: 'Fetched successfully.',
                // raws: products,
                products: results
            });
        })
}

const ReportDesignerOrders = async (req, res, next) => {

    let query = {}
    if (req.query.paymentStatus) {
        query.paymentStatus = req.query.paymentStatus
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

    ProductSummaries.find(query)
        .populate("account", {
            firstName: 1,
            lastName: 1
        })
        .populate("products.order")
        .populate("products.product")
        .then(async productSummaries => {
            let n = 0
            let results = []
            for (let i of productSummaries) {
                for (let j of i.products) {
                    n++
                    let order = j.order
                    let product = j.product
                    // console.log(order.paymentDetail)
                    let productFound = order.paymentDetail.find(element => element.product.toString() == product._id.toString())
                    // console.log(productFound)
                    results.push({
                        no: n,
                        orderNumber: `OD-${order.orderNumber}`,
                        paymentCompleteDate: order.paymentCompleteDate,
                        product: product.productName,
                        designer: `${i.account.firstName} ${i.account.lastName}`,
                        discount: productFound.discount,
                        price: productFound.price,
                        total: productFound.total,
                        transaction: i.transaction ? transaction : '-',
                        paymentStatus: i.paymentStatus,
                        paymentTranferDate: i.paymentTranferDate,
                        paymentTranferSlip: i.paymentTranferSlip,
                        bankAccountName: i.account.bankAccountName ? i.account.bankAccountName : '-',
                        bankName: i.account.bankName ? i.account.bankName : '-'
                    })
                }
            }

            res.status(200).json({
                message: 'Fetched successfully.',
                // raws: productSummaries,
                productSummaries: results
            });
        })
}

module.exports = {
    ReportOrders,
    ReportCustomers,
    ReportDesigners,
    ReportDesigns,
    ReportDesignerOrders,
}