const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true }, // 'created' | 'updated' | 'deleted' | 'checkout' | 'checkin'
    assetId: { type: String, required: true },
    assetName: { type: String, default: "" },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    details: { type: String, default: "" },
  },
  { timestamps: true }
);

activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
