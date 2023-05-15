const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
    },
    transactions: [
      { 
        id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Transaction" 
      } 
    },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Wallet", walletSchema);
