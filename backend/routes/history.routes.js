import express from "express";
import { authMiddleware } from "../controllers/auth.controller.js";
import { getUserHistory } from "../models/history.model.js";

const router = express.Router();

router.get("/my", authMiddleware, async (req, res) => {
  try {
    const rows = await getUserHistory(req.user.id);
    res.json({ history: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

export default router;
