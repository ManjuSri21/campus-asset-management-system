const express = require("express");
const Asset = require("../models/Asset");
const protect = require("../middleware/authMiddleware");
const { logActivity } = require("../utils/activityLogger");

const router = express.Router();

const notDeleted = { deleted: { $ne: true } };

const validateAssetBody = (body, isUpdate = false) => {
  const { assetId, name, category, department, location, status } = body;
  const errors = [];
  if (!isUpdate && (!assetId || typeof assetId !== "string" || !assetId.trim()))
    errors.push("Asset ID is required");
  if (!name || typeof name !== "string" || !name.trim()) errors.push("Name is required");
  if (!category || typeof category !== "string" || !category.trim()) errors.push("Category is required");
  if (!department || typeof department !== "string" || !department.trim()) errors.push("Department is required");
  if (!location || typeof location !== "string" || !location.trim()) errors.push("Location is required");
  const validStatuses = ["Available", "In Use", "Maintenance", "Damaged"];
  if (status && !validStatuses.includes(status)) errors.push("Invalid status");
  return errors;
};

/* ===================== GET ASSET STATS (for dashboard) ===================== */
router.get("/stats", protect, async (req, res) => {
  try {
    const total = await Asset.countDocuments(notDeleted);
    const available = await Asset.countDocuments({ ...notDeleted, status: "Available" });
    const inUse = await Asset.countDocuments({ ...notDeleted, status: "In Use" });
    const maintenance = await Asset.countDocuments({ ...notDeleted, status: "Maintenance" });
    const damaged = await Asset.countDocuments({ ...notDeleted, status: "Damaged" });
    res.json({ total, available, inUse, maintenance, damaged });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ===================== GET RECENT ASSETS (for dashboard) ===================== */
router.get("/recent", protect, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 5, 20);
    const assets = await Asset.find(notDeleted)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("assetId name category status location createdAt");
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ===================== GET CATEGORY BREAKDOWN (for dashboard) ===================== */
router.get("/by-category", protect, async (req, res) => {
  try {
    const breakdown = await Asset.aggregate([
      { $match: notDeleted },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json(breakdown.map((b) => ({ category: b._id, count: b.count })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ===================== GET ACTIVITY LOG ===================== */
router.get("/activity/log", protect, async (req, res) => {
  try {
    const ActivityLog = require("../models/ActivityLog");
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(limit).lean();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ===================== GET ALL ASSETS (with pagination & soft-delete filter) ===================== */
router.get("/", protect, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 25));
    const skip = (page - 1) * limit;
    const q = req.query.q ? req.query.q.trim() : "";

    const filter = { ...notDeleted };
    if (q) {
      filter.$or = [
        { assetId: new RegExp(q, "i") },
        { name: new RegExp(q, "i") },
        { category: new RegExp(q, "i") },
        { department: new RegExp(q, "i") },
        { location: new RegExp(q, "i") },
        { status: new RegExp(q, "i") },
      ];
    }

    const [assets, total] = await Promise.all([
      Asset.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Asset.countDocuments(filter),
    ]);

    res.json({ assets, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ===================== GET ONE ASSET (for edit) ===================== */
router.get("/:id", protect, async (req, res) => {
  try {
    const asset = await Asset.findOne({ _id: req.params.id, ...notDeleted });
    if (!asset) return res.status(404).json({ message: "Asset not found" });
    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ===================== CREATE ASSET (with duplicate check & activity log) ===================== */
router.post("/", protect, async (req, res) => {
  try {
    const errors = validateAssetBody(req.body);
    if (errors.length) return res.status(400).json({ message: errors.join(". ") });

    const { assetId, name, category, department, location, status, assignedTo, nextMaintenanceAt } = req.body;
    const existing = await Asset.findOne({ assetId: (assetId || "").trim(), ...notDeleted });
    if (existing) {
      return res.status(400).json({ message: "An asset with this Asset ID already exists. Please use a unique ID." });
    }

    const payload = {
      assetId: (assetId || "").trim(),
      name: (name || "").trim(),
      category: (category || "").trim(),
      department: (department || "").trim(),
      location: (location || "").trim(),
      status: status || "Available",
      assignedTo: (assignedTo || "").trim(),
      nextMaintenanceAt: nextMaintenanceAt || null,
      updatedBy: req.user?.id ? String(req.user.id) : "",
    };
    if (payload.status === "In Use") {
      payload.checkedOutAt = new Date();
    }

    const asset = await Asset.create(payload);
    await logActivity("created", asset.assetId, asset.name, String(req.user.id), req.user?.fullName || "Admin", "");
    res.status(201).json(asset);
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: "An asset with this Asset ID already exists." });
    res.status(400).json({ message: error.message });
  }
});

/* ===================== UPDATE ASSET (with activity log, check-out/check-in, damage notes) ===================== */
router.put("/:id", protect, async (req, res) => {
  try {
    const asset = await Asset.findOne({ _id: req.params.id, ...notDeleted });
    if (!asset) return res.status(404).json({ message: "Asset not found" });

    const errors = validateAssetBody({ ...asset.toObject(), ...req.body }, true);
    if (errors.length) return res.status(400).json({ message: errors.join(". ") });

    const { status, assignedTo, damageNotes, reportedBy, nextMaintenanceAt } = req.body;
    const updates = { ...req.body };
    updates.updatedBy = req.user?.id ? String(req.user.id) : "";

    if (status === "In Use" && asset.status !== "In Use") {
      updates.checkedOutAt = new Date();
      updates.checkedInAt = null;
      updates.assignedTo = (assignedTo || updates.assignedTo || "").trim();
    }
    if (status === "Available" && asset.status !== "Available") {
      updates.checkedInAt = new Date();
      updates.assignedTo = "";
    }
    if (status === "Damaged") {
      updates.damageNotes = (damageNotes || updates.damageNotes || "").trim();
      updates.reportedBy = (reportedBy || updates.reportedBy || "").trim();
      updates.reportedAt = new Date();
    }
    if (nextMaintenanceAt !== undefined) updates.nextMaintenanceAt = nextMaintenanceAt || null;

    const updated = await Asset.findByIdAndUpdate(req.params.id, updates, { new: true });
    await logActivity("updated", updated.assetId, updated.name, String(req.user.id), req.user?.fullName || "Admin", "");
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/* ===================== DELETE ASSET (soft delete + activity log) ===================== */
router.delete("/:id", protect, async (req, res) => {
  try {
    const asset = await Asset.findOne({ _id: req.params.id, ...notDeleted });
    if (!asset) return res.status(404).json({ message: "Asset not found" });

    await Asset.findByIdAndUpdate(req.params.id, { deleted: true, updatedBy: req.user?.id ? String(req.user.id) : "" });
    await logActivity("deleted", asset.assetId, asset.name, String(req.user.id), req.user?.fullName || "Admin", "");
    res.json({ message: "Asset deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
