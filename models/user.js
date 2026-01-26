const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: String, required: true },
  plan: { type: String, required: true },
  recommend: { type: String },
  receipt: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);