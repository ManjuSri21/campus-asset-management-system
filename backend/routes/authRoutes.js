const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const router = express.Router();

/* ===================== SIGNUP ===================== */
router.post("/signup", async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;

    if (!fullName || !username || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const minPasswordLength = 6;
    if (password.length < minPasswordLength) {
      return res.status(400).json({ message: `Password must be at least ${minPasswordLength} characters` });
    }

    const exists = await Admin.findOne({ $or: [{ username }, { email }] });
    if (exists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await Admin.create({
      fullName,
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Admin registered successfully",
      admin: {
        id: newAdmin._id,
        fullName: newAdmin.fullName,
        username: newAdmin.username,
        email: newAdmin.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ===================== LOGIN ===================== */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { id: admin._id, role: "Admin", fullName: admin.fullName },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      message: "Login success",
      token,
      admin: {
        id: admin._id,
        fullName: admin.fullName,
        username: admin.username,
        email: admin.email,
        role: "Admin",
        photo: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
