const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const accountSchema = new Schema(
  {
    userType: {
      type: Number,
      default: 1,//1=customer, 2=designer
    },
    activate: {
      type: Boolean,
      default: false
    },
    activateCode: {
      type: String,
    },
    acceptPolicy: [{
      type: String,
    }],
    avatar: {
      type: String
    },
    document: [{
      type: String
    }],
    requestDesigner: {
      type: Boolean,
      default: false,
    },
    approveAt: {
      type: Date
    },
    email: {
      type: String,
      index: true,
      required: true,
      unique: true,
    },
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      // required: true
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    id: {
      type: String
    },
    status: {
      type: Number,
      default: 1, //active
    },
    phone: {
      type: String
    },
    address: {
      type: String
    },
    billAddress: {
      type: String
    },
    country: {
      type: String
    },
    designerType: {
      type: Number
    },
    experience: {
      type: Number
    },
    designerLevel: {
      type: Schema.Types.ObjectId,
      index: true,
      ref: "DesignerLevel"
    },
    company: {
      type: String
    },
    companyAddress: {
      type: String
    },
    bankName: {
      type: String
    },
    bankAccountName: {
      type: String
    },
    bankAccount: {
      type: String
    },
    views: {
      type: Number,
      index: true,
      default: 0
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Account', accountSchema);
