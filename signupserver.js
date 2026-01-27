require("dotenv").config(); // must be first

const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const PORT = process.env.PORT || 10000;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// MongoDB connection
mongoose.connect("mongodb+srv://jcayabyab524_db_user:joelpogi123@testdb.zirvvwn.mongodb.net/test")
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error(err));

// Multer image upload
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ dest: 'uploads/' }); // Temporary folder

// User model
const User = require("./models/user");

// Register API
app.post("/register", upload.single("receipt"), async (req, res) => {
    try {
        // 1. Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "my_project_images",
        });

        console.log("Cloudinary URL:", result.secure_url);

        // 2. Create user with Cloudinary URL
        const user = new User({
            name: req.body.name,
            amount: req.body.amount,
            plan: req.body.plan,
            recommend: req.body.recommend,
            receipt: result.secure_url, // ✅ SAVE URL HERE
            receiptPublicId: result.public_id // Save public_id for deletion
        });

        // 3. Save to database
        await user.save();

        // 4. Respond once
        res.json({
            success: true,
            imageUrl: result.secure_url
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Registration failed" });
    }
});


// Get all registered users (ADMIN)
app.get("/admin/users", async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

// Delete user by ID
app.delete("/admin/users/:id", async (req, res) => {
    try {
        const userId = req.params.id;

        // Find user first
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Delete from Cloudinary using public_id
        if (user.receiptPublicId) {
            await cloudinary.uploader.destroy(user.receiptPublicId);
        }

        // Optional: delete from Cloudinary if you stored public_id
        // await cloudinary.uploader.destroy(user.receiptPublicId);

        // Delete from MongoDB
        await User.findByIdAndDelete(userId);

        res.json({ success: true, message: "User deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete user" });
    }
});


app.listen(PORT, () => {
    console.log("Server running on http://renderhosting:10000");
});
