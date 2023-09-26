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
        orderNumber: {
            type: String,
            index: true
        },
        orderStatus: {
            type: Number,
            index: true
        },
        paymentMethod: {
            type: Number,//1 QR, 2 credit
        },
        paymentStatus: {
            type: Number,//1 รอหลักฐาน 2 แนบหลักฐานรอยื่ยัน 3 ยืนยัน 4 reject 5 cancel
            index: true
        },
        paymentCompleteDate: {
            type: Date
        },
        paymentSlip: [{
            type: String,
        }],
        paymentDetail: [{
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
        }],
        totalDiscount: {
            type: Number
        },
        totalPrice: {
            type: Number
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
