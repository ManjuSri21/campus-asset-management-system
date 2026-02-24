const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const mongoose = require("mongoose");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const assetRoutes = require("./routes/assetRoutes");

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/assets", assetRoutes);

app.get("/", (req, res) => {
  res.send("Campus Asset Management Backend Running ");
});

app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const ok = dbState === 1;
  res.status(ok ? 200 : 503).json({
    status: ok ? "ok" : "error",
    database: dbState === 1 ? "connected" : "disconnected",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
