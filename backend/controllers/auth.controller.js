// controllers/auth.controller.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { createUser, getUserByEmail, getUserById } from "../models/user.model.js";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "umar_default_secret";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    console.log("📥 Register request:", { name, email });

    if (!name || !email || !password)
      return res.status(400).json({ error: "name, email and password are required" });

    const existing = await getUserByEmail(email);
    console.log("Existing user?", existing);

    if (existing) return res.status(400).json({ error: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);
    console.log("✅ Password hashed");

    const userId = await createUser(name, email, hash);
    console.log("✅ User created with ID:", userId);

    const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    return res.json({
      message: "Registration successful",
      token,
      user: { id: userId, name, email },
    });
  } catch (err) {
    console.error("❌ Register error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}


export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email and password are required" });

    const user = await getUserByEmail(email);
    if (!user) return res.status(404).json({ error: "User not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    // return safe user object (without password)
    const safeUser = { id: user.id, name: user.name, email: user.email, created_at: user.created_at };
    return res.json({ message: "Login successful", token, user: safeUser });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Login failed" });
  }
}

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) return res.status(401).json({ error: "Authorization header missing" });
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // payload contains id & email
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export async function me(req, res) {
  try {
    const id = req.user && req.user.id;
    if (!id) return res.status(401).json({ error: "Invalid token payload" });
    const user = await getUserById(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ user });
  } catch (err) {
    console.error("Me error:", err);
    return res.status(500).json({ error: "Failed to fetch user" });
  }
}
