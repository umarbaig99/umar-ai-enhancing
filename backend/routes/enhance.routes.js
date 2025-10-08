// routes/enhance.routes.js
import express from "express";
import multer from "multer";
import { enhanceImageHandler } from "../controllers/enhance.controller.js";

const router = express.Router();

// Memory storage for uploaded image
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Public endpoint — no login required
router.post("/", upload.single("file"), enhanceImageHandler);

export default router;
