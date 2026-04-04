const mongoose = require("mongoose");

const assetRequestSchema = new mongoose.Schema(
    {
        technicianId: { type: mongoose.Schema.Types.ObjectId, ref: "Technician", required: true },
        type: {
            type: String,
            enum: ["Damage Report", "New Asset"],
            required: true,
        },
        assetId: { type: String, default: "" }, // Optional for new asset requests
        assetName: { type: String, required: true },
        location: { type: String, required: true },
        description: { type: String, required: true },
        urgency: {
            type: String,
            enum: ["Low", "Medium", "High"],
            default: "Medium",
        },
        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected", "In Progress", "Completed"],
            default: "Pending",
        },
        adminNotes: { type: String, default: "" },
        isReadByTechnician: { type: Boolean, default: true },
        isReadByAdmin: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model("AssetRequest", assetRequestSchema); 
