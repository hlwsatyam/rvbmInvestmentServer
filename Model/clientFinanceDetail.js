const mongoose = require("mongoose");

const clientFinanceSchema = new mongoose.Schema(
  {
    initialAmount: {
      type: Number,
      max: 50000000,
      min: 5000,
      required: true,
    },
    CAGR: {
      type: Number,
      required: true,
    },
    returnedAmount: {
      type: Number,
      required: true,
    },
    maturity_time:{
      type: Number,
      required: true,
    },
    totalEarnings: {
      type: Number,
      required: true,
    },
    client_details: {
      type: mongoose.Types.ObjectId,
      ref: "client",
      required: true,
    },
  },
  { timestamps: true }
);

const ClientFinanceModel = mongoose.model("clientfinance", clientFinanceSchema);

module.exports = { ClientFinanceModel };
