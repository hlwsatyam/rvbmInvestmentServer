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
    
    },
    postal: {
      type: Number,
     
    },
    current_address: {
      type: String,
    },
    permanent_address: {
      type: String,
    },

    is_KYC_completed: {
      type: Boolean,
      default: false,
    },
    gender: {
      type: String,
    },
    customer_id: {
      type: String,
      index: true,
      unique: true,
      sparse: true,
    },
    aadhaar: {
      type: Number,
      index: true,
      unique: true,
      sparse: true,
    },

    pan_number: {
      type: String,
      index: true,
      unique: true,
      sparse: true,
    },
    aadhaar_details: {
      type: mongoose.Schema.Types.Mixed,
    },
    banks_details: {
      type: mongoose.Types.ObjectId,
      ref: "clientbank",
    },
    finance_details: [
      { type: mongoose.Schema.Types.ObjectId, ref: "clientfinance" },
    ],
    familyfd_details: [{ type: mongoose.Schema.Types.ObjectId, ref: "client" }],
  },
  { timestamps: true }
);

const ClientModel = mongoose.model("client", clientSchema);

module.exports = { ClientModel };
