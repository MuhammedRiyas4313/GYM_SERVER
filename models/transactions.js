const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  payee: String,
  reciever: String,
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
