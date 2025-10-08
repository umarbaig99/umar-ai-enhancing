import { db } from "./db.js";

export async function addHistory(user_id, original_url, enhanced_url) {
  const [res] = await db.execute(
    "INSERT INTO history (user_id, original_url, enhanced_url) VALUES (?, ?, ?)",
    [user_id, original_url, enhanced_url]
  );
  return res.insertId;
}

export async function getUserHistory(user_id) {
  const [rows] = await db.execute(
    "SELECT id, original_url, enhanced_url, created_at FROM history WHERE user_id = ? ORDER BY id DESC",
    [user_id]
  );
  return rows;
}
