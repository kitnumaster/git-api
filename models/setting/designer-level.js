const mongoose = require('mongoose')
const Schema = mongoose.Schema

const DesignerLevelSchema = new Schema(
    {
        designerLevelName: {
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

module.exports = mongoose.model('DesignerLevel', DesignerLevelSchema);
