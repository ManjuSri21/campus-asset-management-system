const ActivityLog = require("../models/ActivityLog");

const logActivity = async (action, assetId, assetName, userId, userName, details = "") => {
  try {
    await ActivityLog.create({
      action,
      assetId,
      assetName: assetName || "",
      userId,
      userName: userName || "Unknown",
      details,
    });
  } catch (err) {
    console.error("Activity log error:", err.message);
  }
};

module.exports = { logActivity };
