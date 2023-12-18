const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
    },
    step: {
      type: Number,
      default: 0,
    },
    email: {
      type: String,
      required: true,
    },
    phone_number: {
      type: String,
      unique: true,
      required: true,
    },
    postal: {
      type: String,
      required: true,
    },
    current_address: {
      type: String,
    
    },
    permanent_address: {
      type: String,
    },
    adhar_linked: {
      type: Boolean,
    },
    gender: {
      type: String,
    },
    aadhaar: {
      type: String,
      unique: true,
    },
    pan_details: {
      type: {},
    },
    banks_details: {
      type: mongoose.Types.ObjectId,
      ref: "clientbank",
    },
    finance_details: [{ type: mongoose.Schema.Types.ObjectId, ref: "clientfinance" }],
  },
  { timestamps: true }
);

const ClientModel = mongoose.model("client", clientSchema);

module.exports = { ClientModel };
