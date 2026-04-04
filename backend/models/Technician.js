const mongoose = require("mongoose");

const technicianSchema = new mongoose.Schema(
    {
        techId: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        dept: { type: String, required: true },
        gender: {
            type: String,
            required: true,
            enum: ["male", "female"]
        },
        status: {
            type: String,
            required: true,
            enum: ["Active", "In-active"],
            default: "Active"
        },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        username: { type: String, required: true, unique: true },
        role: { type: String, default: "Technician" }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Technician", technicianSchema);
