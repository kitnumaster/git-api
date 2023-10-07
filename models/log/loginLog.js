const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const loginLogSchema = new Schema(
    {
        account: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
            ref: 'Account'
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('LoginLog', loginLogSchema);
