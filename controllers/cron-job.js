const Order = require('../models/order')
const Product = require('../models/product')
const CheckOrderStatus = async () => {

    const orders = await Order.find({
        "createdAt": { $lte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        "paymentStatus": 1
    })

    for (let i of orders) {
        console.log(i)
        await Order.useFindAndModify(i._id, {
            paymentStatus: 5
        })

        let productId = []
        for (let j of i.paymentDetail) {
            productId.push(j.product)
        }

        await Product.updateMany(
            {
                _id: {
                    $in: productId
                }
            }, {
            sold: false,
        })

    }

}

module.exports = {
    CheckOrderStatus
}