const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const newsSchema = new Schema(
    {
        topicEN: {
            type: String,
            required: true,
            index: true,
        },
        topicTH: {
            type: String,
            required: true,
            index: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            index: true,
            ref: "User"
        },
        cover: {
            type: String,
        },
        shortEN: {
            type: String,
        },
        shortTH: {
            type: String,
        },
        detailEN: {
            type: String
        },
        detailTH: {
            type: String
        },
        tags: [{
            type: String,
            index: true
        }],
        newsPublic: {
            type: Boolean,
            default: true,
            index: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('News', newsSchema);
