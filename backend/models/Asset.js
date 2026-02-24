const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema(
  {
    assetId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    department: { type: String, required: true },
    location: { type: String, required: true },
    status: {
      type: String,
      enum: ["Available", "In Use", "Maintenance", "Damaged"],
      default: "Available",
    },
    condition: {
      type: String,
      enum: ["Good", "Damaged", "Needs Repair"],
      default: "Good",
    },
    assignedTo: { type: String, default: "" },
    checkedOutAt: { type: Date, default: null },
    checkedInAt: { type: Date, default: null },
    damageNotes: { type: String, default: "" },
    reportedBy: { type: String, default: "" },
    reportedAt: { type: Date, default: null },
    nextMaintenanceAt: { type: Date, default: null },
    deleted: { type: Boolean, default: false },
    updatedBy: { type: String, default: "" },
  },
  { timestamps: true }
);

assetSchema.index({ assetId: 1 });
assetSchema.index({ category: 1 });
assetSchema.index({ department: 1 });
assetSchema.index({ status: 1 });
assetSchema.index({ createdAt: -1 });
assetSchema.index({ deleted: 1 });

module.exports = mongoose.model("Asset", assetSchema);
