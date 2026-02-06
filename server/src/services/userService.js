const bcrypt = require("bcryptjs");
const { get, run } = require("../database/db");
const { HttpError } = require("../utils/httpError");

async function createUser({ email, password, role }) {
  const existing = await get("SELECT id FROM users WHERE email = ?", [email]);
  if (existing) throw new HttpError(409, "Email already registered");

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await run(
    "INSERT INTO users (email, passwordHash, role) VALUES (?, ?, ?)",
    [email, passwordHash, role]
  );

  return { id: result.lastID, email, role };
}

async function verifyUserCredentials({ email, password }) {
  const user = await get(
    "SELECT id, email, passwordHash, role FROM users WHERE email = ?",
    [email]
  );
  if (!user) throw new HttpError(401, "Invalid credentials");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new HttpError(401, "Invalid credentials");

  return { id: user.id, email: user.email, role: user.role };
}

async function getUserById(id) {
  const user = await get("SELECT id, email, role, createdAt FROM users WHERE id = ?", [id]);
  return user || null;
}

module.exports = { createUser, verifyUserCredentials, getUserById };
