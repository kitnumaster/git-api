const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SetSchema = new Schema(
    {
        setName: {
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

module.exports = mongoose.model('Set', SetSchema);
