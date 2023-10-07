const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema(
    {
        account: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Account'
        },
        sold: {
            type: Boolean,
            index: true,
            default: false
        },
        productName: {
            type: String,
            index: true
        },
        productNameTH: {
            type: String,
            index: true
        },
        productCover: {
            type: String
        },
        productDetail: {
            type: String,
            index: true
        },
        productDetailTH: {
            type: String,
            index: true
        },
        material: [{
            type: Schema.Types.ObjectId,
            index: true,
            ref: 'Material'
        }],
        jewerlyType: {
            type: Schema.Types.ObjectId,
            index: true,
            ref: 'JewerlyType'
        },
        housing: [{
            type: Schema.Types.ObjectId,
            index: true,
            ref: 'Housing'
        }],
        trend: [{
            type: Schema.Types.ObjectId,
            index: true,
            ref: 'Trend'
        }],
        designerLevel: {
            type: Number,
            index: true
        },
        detail: {
            type: Schema.Types.ObjectId,
            index: true,
            ref: 'Detail'
        },
        fileType: [{
            type: Schema.Types.ObjectId,
            index: true,
            ref: 'FileType'
        }],
        set: {
            type: Schema.Types.ObjectId,
            index: true,
            ref: 'Set'
        },
        otherFiles: [{
            type: String,
        }],
        files: [{
            fileType: {
                type: String,
            },
            filePath: {
                type: String
            }
        }],
        discount: {
            type: Number,
            default: 0.00
        },
        price: {
            type: Number,
        },
        active: {
            type: Boolean,
            index: true,
            default: true
        },
        views: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
