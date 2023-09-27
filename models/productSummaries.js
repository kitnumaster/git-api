const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSummarySchema = new Schema(
    {
        account: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
            ref: 'Account'
        },
        summaryNumber: {
            type: String,
            unique: true,
        },
        product: [{
            type: Schema.Types.ObjectId,
            index: true,
            ref: "Product"
        }],
        price: {
            type: Number
        },
        discount: {
            type: Number
        },
        total: {
            type: Number
        },
        order: [{
            type: Schema.Types.ObjectId,
            index: true,
            ref: "Order"
        }],
        paymentStatus: {
            type: Number,//1 รอหลักฐาน 2 แนบหลักฐานรอยื่ยัน 3 ยืนยัน 4 reject 5 cancel
            index: true
        },
        paymentTranferDate: {
            type: Date,
            index: true
        },
        paymentTranferPrice: {
            type: String,
        },
        paymentTranferSlip: [{
            type: String,
        }],
        summaryMonth: {
            type: String,
            index: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('ProductSummary', productSummarySchema);
