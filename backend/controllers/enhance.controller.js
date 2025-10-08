// controllers/enhance.controller.js
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import { addHistory } from "../models/history.model.js";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";
const uploadPath = path.join(__dirname, "..", UPLOAD_DIR);
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

// Helper to save file buffer
function saveBuffer(name, buffer) {
  const p = path.join(uploadPath, name);
  fs.writeFileSync(p, buffer);
  return `/uploads/${name}`;
}

/* =====================================================
   🧠 Remini-Like AI Enhancement Engine
   (Tuned for portrait clarity, natural tone, soft background)
===================================================== */
async function localProEnhance(buffer, type = "enhance") {
  let img = sharp(buffer).rotate();


// Step 1️⃣ — Base cleanup (denoise + gentle sharpen)
img = img
  .resize({ width: 2000, withoutEnlargement: true })
  .median(1) // reduce noise
  .blur(0.35) // ✅ fixed (Sharp requires >= 0.3)
  .sharpen(1.2);


  // Step 2️⃣ — Light & tone correction
  img = img
    .linear(1.08, -6)
    .modulate({
      brightness: 1.05,
      saturation: 1.1,
      hue: 1,
    })
    .gamma(1.02)
    .normalize();

  // Step 3️⃣ — Enhancement Type Handling
  switch (type.toLowerCase()) {
    case "sharpen":
      img = img
        .sharpen(1.8)
        .linear(1.1, -5)
        .modulate({ brightness: 1.05, saturation: 1.1 });
      break;

    case "colorize":
      img = img.modulate({ brightness: 1.06, saturation: 1.35 });
      break;

    case "restore":
      img = img.blur(0.5).median(2).sharpen(1.3).linear(1.05, -4);
      break;

    default:
      // Main ENHANCE mode – realistic and natural
      img = img
        .sharpen(1.5)
        .modulate({ brightness: 1.05, saturation: 1.15 })
        .linear(1.08, -5)
        .gamma(1.03);
  }

  // Step 4️⃣ — Portrait polish (soft background + crisp subject)
  img = img
    .convolve({
      width: 3,
      height: 3,
      kernel: [
        0, -0.4, 0,
        -0.4, 3, -0.4,
        0, -0.4, 0,
      ],
    })
    .modulate({ brightness: 1.02, saturation: 1.05 });

  // Step 5️⃣ — Output HQ JPEG
  return await img.jpeg({ quality: 97, chromaSubsampling: "4:4:4" }).toBuffer();
}

/* =====================================================
   🚀 Main Handler (Public)
===================================================== */
export async function enhanceImageHandler(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const buffer = req.file.buffer;
    const id = uuidv4();
    const originalName = `${id}-original.jpg`;
    const enhancedName = `${id}-enhanced.jpg`;

    const originalPath = saveBuffer(originalName, buffer);

    const type = req.query.type || "enhance";
    const enhancedBuffer = await localProEnhance(buffer, type);
    const enhancedPath = saveBuffer(enhancedName, enhancedBuffer);

    // Save history if user logged in
    const userId = req.user?.id || null;
    if (userId) {
      await addHistory(userId, originalPath, enhancedPath);
    }

    return res.json({
      message: "Enhanced with Umar AI Pro Engine ⚡",
      original: originalPath,
      enhanced: enhancedPath,
    });
  } catch (err) {
    console.error("❌ Enhancement failed:", err);
    return res.status(500).json({ error: "Local AI enhancement failed." });
  }
}
