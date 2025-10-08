// models/user.model.js
import { db } from "./db.js";

export async function createUser(name, email, passwordHash) {
  const [result] = await db.execute(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, passwordHash]
  );
  return result.insertId;
}

export async function getUserByEmail(email) {
  const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0];
}

export async function getUserById(id) {
  const [rows] = await db.execute("SELECT id, name, email, created_at FROM users WHERE id = ?", [id]);
  return rows[0];
}
