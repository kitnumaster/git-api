const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const designerViewLogSchema = new Schema(
    {
        account: {
            type: Schema.Types.ObjectId,
            index: true,
            ref: 'Account'
        },
        designer: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
            ref: 'Account'
        },
        IP: {
            type: String
        }
    },
    {
        collection: 'designerViewLogs',
        timestamps: true
    }
);

module.exports = mongoose.model('DesignerViewLog', designerViewLogSchema);
