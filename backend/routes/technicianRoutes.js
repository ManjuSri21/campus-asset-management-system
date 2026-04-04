const express = require("express");
const Technician = require("../models/Technician");
const protect = require("../middleware/authMiddleware");
const bcrypt = require("bcryptjs");

const router = express.Router();

// Validation helper
const validateTechBody = (body, isUpdate = false) => {
    const { techId, name, dept, gender, status, email, password, username } = body;
    const errors = [];
    if (!isUpdate && (!techId || !techId.trim())) errors.push("Technician ID is required");
    if (name && !name.trim()) errors.push("Name is required");
    if (dept && !dept.trim()) errors.push("Department is required");
    if (gender && !["male", "female"].includes(gender.toLowerCase())) errors.push("Valid gender (male/female) is required");
    if (status && !["Active", "In-active"].includes(status)) errors.push("Invalid status");

    if (!isUpdate) {
        if (!email) errors.push("Email is required");
        if (!password) errors.push("Password is required");
        if (!username) errors.push("Username is required");
    }
    return errors;
};

/* ===================== GET ALL TECHNICIANS ===================== */
router.get("/", protect, async (req, res) => {
    try {
        const q = req.query.q ? req.query.q.trim() : "";
        const gender = req.query.gender;

        const filter = {};
        if (gender) filter.gender = gender;
        if (q) {
            filter.$or = [
                { techId: new RegExp(q, "i") },
                { name: new RegExp(q, "i") },
                { dept: new RegExp(q, "i") },
                { username: new RegExp(q, "i") },
                { email: new RegExp(q, "i") },
            ];
        }

        const technicians = await Technician.find(filter).sort({ techId: 1 }).select("-password");
        res.json(technicians);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/* ===================== GET TECH STATS ===================== */
router.get("/stats", protect, async (req, res) => {
    try {
        const maleCount = await Technician.countDocuments({ gender: "male" });
        const femaleCount = await Technician.countDocuments({ gender: "female" });
        res.json({ maleCount, femaleCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/* ===================== GET ONE TECHNICIAN ===================== */
router.get("/:id", protect, async (req, res) => {
    try {
        const tech = await Technician.findById(req.params.id).select("-password");
        if (!tech) return res.status(404).json({ message: "Technician not found" });
        res.json(tech);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/* ===================== CREATE TECHNICIAN ===================== */
router.post("/", protect, async (req, res) => {
    try {
        const errors = validateTechBody(req.body);
        if (errors.length) return res.status(400).json({ message: errors.join(". ") });

        const { techId, name, dept, gender, status, email, password, username } = req.body;

        // Check for duplicate techId, email, or username
        const existing = await Technician.findOne({
            $or: [
                { techId: techId.trim() },
                { email: email.trim() },
                { username: username.trim() }
            ]
        });
        if (existing) {
            return res.status(400).json({ message: "A technician with this ID, email, or username already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const tech = await Technician.create({
            techId: techId.trim(),
            name: name.trim(),
            dept: dept.trim(),
            gender: gender.toLowerCase(),
            status: status || "Active",
            email: email.trim(),
            username: username.trim(),
            password: hashedPassword
        });

        const techObj = tech.toObject();
        delete techObj.password;
        res.status(201).json(techObj);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/* ===================== UPDATE TECHNICIAN ===================== */
router.put("/:id", protect, async (req, res) => {
    try {
        const tech = await Technician.findById(req.params.id);
        if (!tech) return res.status(404).json({ message: "Technician not found" });

        const { name, dept, gender, status, email, password, username } = req.body;

        if (name) tech.name = name.trim();
        if (dept) tech.dept = dept.trim();
        if (gender) tech.gender = gender.toLowerCase();
        if (status) tech.status = status;
        if (email) tech.email = email.trim();
        if (username) tech.username = username.trim();
        if (password) {
            tech.password = await bcrypt.hash(password, 10);
        }

        const updated = await tech.save();
        const updatedObj = updated.toObject();
        delete updatedObj.password;
        res.json(updatedObj);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/* ===================== DELETE TECHNICIAN ===================== */
router.delete("/:id", protect, async (req, res) => {
    try {
        const tech = await Technician.findById(req.params.id);
        if (!tech) return res.status(404).json({ message: "Technician not found" });

        await Technician.findByIdAndDelete(req.params.id);
        res.json({ message: "Technician deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
