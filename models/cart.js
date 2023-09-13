const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new Schema(
    {
        account: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
            ref: 'Account'
        },
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
    { timestamps: true }
);

module.exports = mongoose.model('Cart', cartSchema);
