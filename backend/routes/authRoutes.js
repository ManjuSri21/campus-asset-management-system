const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const Technician = require("../models/Technician");

const router = express.Router();

/* ===================== SIGNUP (Admin only) ===================== */
router.post("/signup", async (req, res) => {
  try {
    const { fullName, username, email, password, secretKey } = req.body;
    if (!fullName || !username || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Security: Check for Admin Secret Key if admins already exist
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      if (!secretKey || secretKey !== process.env.ADMIN_SIGNUP_KEY) {
        return res.status(403).json({ message: "Invalid or missing Admin Registration Key. Contact an existing admin." });
      }
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
        role: "Admin"
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ===================== LOGIN (Unified) ===================== */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check Admin first
    let user = await Admin.findOne({ username });
    let role = "Admin";

    // If not admin, check Technician
    if (!user) {
      user = await Technician.findOne({ username });
      role = "Technician";
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Role-specific data
    const payload = {
      id: user._id,
      role: role,
      fullName: user.fullName || user.name
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "3h" }
    );

    res.json({
      message: "Login success",
      token,
      user: {
        id: user._id,
        fullName: user.fullName || user.name,
        username: user.username,
        email: user.email,
        role: role,
        dept: user.dept || "N/A",
        photo: role === "Admin"
          ? "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          : "https://cdn-icons-png.flaticon.com/512/6009/6009110.png",
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
