const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productViewLogSchema = new Schema(
    {
        account: {
            type: Schema.Types.ObjectId,
            index: true,
            ref: 'Account'
        },
        product: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
            ref: 'Product'
        },
        IP: {
            type: String
        }
    },
    {
        collection: 'productViewLogs',
        timestamps: true
    }
);

module.exports = mongoose.model('ProductViewLog', productViewLogSchema);
