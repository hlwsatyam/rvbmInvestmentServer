// const mongoose = require("mongoose");

// const clientSchema = new mongoose.Schema(
//   {
//     full_name: {
//       type: String,
//     },
//     step: {
//       type: Number,
//       default: 0,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     phone_number: {
//       type: String,
//       unique: true,
//       required: true,
//     },
//     postal: {
//       type: Number,
//       required: true,
//     },
//     current_address: {
//       type: String,
//     },
//     permanent_address: {
//       type: String,
//     },

//     is_KYC_completed: {
//       type: Boolean,
//       default: false,
//     },
//     gender: {
//       type: String,
//     },
//     fd_number: {
//       type: String,
//       default: null,
//     },
//     aadhaar: {
//       type: Number,
//       unique: true,
//     },

//     pan_number: {
//       type: String,
//       unique: true,
//     },
//     aadhaar_details: {
//       type: mongoose.Schema.Types.Mixed,
//     },
//     banks_details: {
//       type: mongoose.Types.ObjectId,
//       ref: "clientbank",
//     },
//     finance_details: [
//       { type: mongoose.Schema.Types.ObjectId, ref: "clientfinance" },
//     ],
//   },
//   { timestamps: true }
// );

// const ClientModel = mongoose.model("client", clientSchema);

// module.exports = { ClientModel };



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
      index:true,
      unique:true,
      sparse:true

    },
    phone_number: {
      type: String,
      index:true,
      unique:true,
      sparse:true,
      required: true,
    },
    postal: {
      type: Number,
      required: true,
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
    fd_number: {
      type: String,
      index:true,
      unique:true,
      sparse:true
    },
    aadhaar: {
      type: Number,
     
      index:true,
      unique:true,
      sparse:true
    },

    pan_number: {
      type: String,
      index:true,
      unique:true,
      sparse:true
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
  },
  { timestamps: true }
);

const ClientModel = mongoose.model("client", clientSchema);

module.exports = { ClientModel };
