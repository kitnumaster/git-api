const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const homePageSchema = new Schema(
    {
        name: {
            type: String
        },
        files: [{
            type: String
        }],
        link: {
            type: String
        },
        type: {
            type: String
        },
        active: {
            type: Boolean,
            default: true
        }
    },
    {
        collection: "homePage",
        timestamps: true
    }
);

module.exports = mongoose.model('HomePage', homePageSchema);
