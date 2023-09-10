const mongoose = require('mongoose')
const Schema = mongoose.Schema

const FileTypeSchema = new Schema(
    {
        fileTypeName: {
            type: String,
            required: true,
            index: true,
        },
        fileTypeNameTH: {
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

module.exports = mongoose.model('FileType', FileTypeSchema);
