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
        transaction: {
            type: String
        },
        summaryNumber: {
            type: String,
            unique: true,
        },
        products: [
            {
                order: {
                    type: Schema.Types.ObjectId,
                    index: true,
                    ref: "Order"
                },
                product: {
                    type: Schema.Types.ObjectId,
                    index: true,
                    ref: "Product"
                }
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
        paymentStatus: {
            type: Number,//1 รอหลักฐาน 2 แนบหลักฐานรอยื่ยัน 3 ยืนยัน 4 reject 5 cancel
            index: true
        },
        tranferFee: {
            type: Number
        },
        transferAmount: {
            type: Number
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
