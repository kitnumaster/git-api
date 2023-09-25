const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderProductSchema = new Schema(
    {
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
        },
        order: {
            type: Schema.Types.ObjectId,
            index: true,
            ref: "Order"
        },
        paymentStatus: {
            type: Number,//1 รอหลักฐาน 2 แนบหลักฐานรอยื่ยัน 3 ยืนยัน 4 reject 5 cancel
            index: true
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('OrderProduct', orderProductSchema);
