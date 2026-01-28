const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    amount: String,
    plan: String,
    recommend: String,
    receipt: String, // Cloudinary URL
    receiptPublicId: String    // Cloudinary public_id
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);

