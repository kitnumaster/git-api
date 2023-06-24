const mongoose = require('mongoose')
const Schema = mongoose.Schema

const JewerlyTypeSchema = new Schema(
    {
        jewerlyTypeName: {
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
        collation: 'jewerlyTypes',
        timestamps: true,
    },
)

module.exports = mongoose.model('JewerlyType', JewerlyTypeSchema);
