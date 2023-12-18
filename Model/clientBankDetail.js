const mongoose = require("mongoose");

const clientBankSchema = new mongoose.Schema(
  {
    accountHolder: {
      type: String,
      required: true,
    },
    accountHolderBank: {
      type: String,
      required: true,
    },
    accountHolderAccount: {
      type: Number,
      required: true,
    },
    accountHolderBranch: {
      type: String,
      required: true,
    },
    accountHolderIfsc: {
      type: String,
      required: true,
    },
    accountHolderCheck: {
      type: String,
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

const ClientBankModel = mongoose.model("clientbank", clientBankSchema);

module.exports = { ClientBankModel };
