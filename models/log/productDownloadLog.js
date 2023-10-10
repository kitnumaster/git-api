const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productDownloadLogSchema = new Schema(
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
        collection: 'productDownloadLogs',
        timestamps: true
    }
);

module.exports = mongoose.model('ProductDownloadLog', productDownloadLogSchema);
