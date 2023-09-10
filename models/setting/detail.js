const mongoose = require('mongoose')
const Schema = mongoose.Schema

const DetailSchema = new Schema(
    {
        detailName: {
            type: String,
            required: true,
            index: true,
        },
        detailNameTH: {
            type: String,
            required: true,
            index: true,
        },
        active: {
            type: Boolean,
            required: true,
            index: true,
            default: true,
        },
    },
    {
        timestamps: true,
    },
)

module.exports = mongoose.model('Detail', DetailSchema);
