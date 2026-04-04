const express = require("express");
const AssetRequest = require("../models/AssetRequest");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

/* ===================== SUBMIT REQUEST (Technician) ===================== */
router.post("/", protect, async (req, res) => {
    try {
        const { type, assetId, assetName, location, description, urgency } = req.body;

        if (!type || !assetName || !location || !description) {
            return res.status(400).json({ message: "Type, Asset Name, Location, and Description are required" });
        }

        const request = await AssetRequest.create({
            technicianId: req.user.id,
            type,
            assetId,
            assetName,
            location,
            description,
            urgency,
        });

        res.status(201).json(request);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/* ===================== GET ALL REQUESTS (Admin/Technician) ===================== */
router.get("/", protect, async (req, res) => {
    try {
        const filter = {};
        if (req.user.role === "Technician") {
            filter.technicianId = req.user.id;
        }

        const requests = await AssetRequest.find(filter)
            .populate("technicianId", "name techId")
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/* ===================== UPDATE REQUEST STATUS (Admin) ===================== */
router.put("/:id/status", protect, async (req, res) => {
    try {
        if (req.user.role !== "Admin") {
            return res.status(403).json({ message: "Only admins can update request status" });
        }

        const { status, adminNotes } = req.body;
        const request = await AssetRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        request.status = status || request.status;
        request.adminNotes = adminNotes || request.adminNotes;
        request.isReadByTechnician = false; // Reset for technician notification
        request.isReadByAdmin = true; // Admin has handled it

        const updated = await request.save();
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/* ===================== MARK ALL AS READ (Technician) ===================== */
router.put("/mark-as-read", protect, async (req, res) => {
    try {
        if (req.user.role !== "Technician") {
            return res.status(403).json({ message: "Only technicians can mark their notifications as read" });
        }
        await AssetRequest.updateMany(
            { technicianId: req.user.id, isReadByTechnician: false },
            { isReadByTechnician: true }
        );
        res.json({ message: "Notifications marked as read" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/* ===================== MARK ALL AS READ (Admin) ===================== */
router.put("/mark-admin-read", protect, async (req, res) => {
    try {
        if (req.user.role !== "Admin") {
            return res.status(403).json({ message: "Only admins can mark notifications as read" });
        }
        await AssetRequest.updateMany(
            { isReadByAdmin: false },
            { isReadByAdmin: true }
        );
        res.json({ message: "Admin notifications marked as read" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
