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
    maturity_time: {
      type: Number,
      required: true,
    },
    totalEarnings: {
      type: Number,
      required: true,
    },
    maturity_initialize_time: {
      type: Date,
      default: Date.now,
    },
    maturity_start_date: {
      type: String,
    },
    payment_success: {
      type: Boolean,
      default: false,
    },
    client_details: {
      type: mongoose.Types.ObjectId,
      ref: "client",
      required: true,
    },
    fd_number: {
      type: Number,
    },
  },
  { timestamps: true }
);

const ClientFinanceModel = mongoose.model("clientfinance", clientFinanceSchema);

module.exports = { ClientFinanceModel };
