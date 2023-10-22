const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productFavoriteSchema = new Schema(
    {
        account: {
            type: Schema.Types.ObjectId,
            index: true,
            ref: "Account"
        },
        product: {
            type: Schema.Types.ObjectId,
            index: true,
            ref: "Product"
        },
    },
    {
        collection: 'productFavorites',
        timestamps: true
    }
);

module.exports = mongoose.model('ProductFavorite', productFavoriteSchema);
