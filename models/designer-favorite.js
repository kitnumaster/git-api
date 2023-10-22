const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const designerFavoriteSchema = new Schema(
    {
        account: {
            type: Schema.Types.ObjectId,
            index: true,
            ref: "Account"
        },
        designer: {
            type: Schema.Types.ObjectId,
            index: true,
            ref: "Account"
        },
    },
    {
        collection: 'designerFavorites',
        timestamps: true
    }
);

module.exports = mongoose.model('DesignerFavorite', designerFavoriteSchema);
