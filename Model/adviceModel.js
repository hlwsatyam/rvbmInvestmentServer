const mongoose = require("mongoose");

const adviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    phone: {
      type: String,
    },
    message: {
      type: String,
    },
  },
  { timestamps: true }
);

const AdviceModel = mongoose.model("advice", adviceSchema);

module.exports = { AdviceModel };
