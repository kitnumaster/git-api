const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roleSchema = new Schema(
    {
        name: {
            type: String,
            index: true,
            required: true,
            unique: true
        },
        permission: [{
            name: {
                type: String
            },
            read: {
                type: Boolean
            },
            write: {
                type: Boolean
            },
            delete: {
                type: Boolean
            },
        }]
    },
    { timestamps: true }
);

module.exports = mongoose.model('Role', roleSchema);
