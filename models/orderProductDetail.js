const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema(
    {
        account: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
            ref: 'Account'
        },
        order: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
            ref: 'Order'
        },
        orderStatus: {
            type: Number,
            index: true
        },
        paymentStatus: {
            type: Number,
            index: true
        },
        paymentDetail: {
            product: {
                type: Schema.Types.ObjectId,
                index: true,
                ref: "Product"
            },
            price: {
                type: Number
            },
            discount: {
                type: Number
            },
            total: {
                type: Number
            }
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
