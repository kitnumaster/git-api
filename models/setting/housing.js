const mongoose = require('mongoose')
const Schema = mongoose.Schema

const HousingSchema = new Schema(
    {
        housingName: {
            type: String,
            required: true,
            index: true,
        },
        housingNameTH: {
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

module.exports = mongoose.model('Housing', HousingSchema);
