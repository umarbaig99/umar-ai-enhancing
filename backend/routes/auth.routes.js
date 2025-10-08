// routes/auth.routes.js
import express from "express";
import { register, login, me, authMiddleware } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, me);

export default router;
