const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {
      type: String,
      index: true,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: "Role"
    },
    userType: {
      type: Number, //1 admin, 2,designer, 3 customer
      require: true
    },
    status: {
      type: String,
      default: 'I am new!'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
