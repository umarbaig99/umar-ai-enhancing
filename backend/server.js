// backend/server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import enhanceRoutes from "./routes/enhance.routes.js";
import historyRoutes from "./routes/history.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🧠 Get current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📁 Uploads folder setup
const uploadDir = path.join(__dirname, process.env.UPLOAD_DIR || "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use("/uploads", express.static(uploadDir));

// 📁 Frontend folder serve
const frontendPath = path.join(__dirname, "../frontend"); // ✅ fixed relative path
app.use(express.static(frontendPath));

// 📡 API routes
app.use("/api/auth", authRoutes);
app.use("/api/enhance", enhanceRoutes);
app.use("/api/history", historyRoutes);

// 🌐 Serve frontend for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// 🚀 Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running at: http://localhost:${PORT}`);
});
