const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { get, run } = require("./db");

async function initDb() {
  const dbPath = process.env.DB_PATH || "./data/app.sqlite";
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  await run(
    "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, passwordHash TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('user','admin')), createdAt TEXT NOT NULL DEFAULT (datetime('now')))"
  );

  await run(
    "CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, price REAL NOT NULL, category TEXT NOT NULL, keywords TEXT NOT NULL, createdBy INTEGER NOT NULL, createdAt TEXT NOT NULL DEFAULT (datetime('now')), FOREIGN KEY(createdBy) REFERENCES users(id) ON DELETE CASCADE)"
  );

  await run(
    "CREATE TABLE IF NOT EXISTS cart_items (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER NOT NULL, productId INTEGER NOT NULL, quantity INTEGER NOT NULL DEFAULT 1, createdAt TEXT NOT NULL DEFAULT (datetime('now')), UNIQUE(userId, productId), FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY(productId) REFERENCES products(id) ON DELETE CASCADE)"
  );

  await run(
    "CREATE TABLE IF NOT EXISTS user_activity (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER NOT NULL, productId INTEGER NOT NULL, type TEXT NOT NULL CHECK(type IN ('viewed','cart_add')), createdAt TEXT NOT NULL DEFAULT (datetime('now')), FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY(productId) REFERENCES products(id) ON DELETE CASCADE)"
  );

  await run(
    "CREATE TABLE IF NOT EXISTS product_images (id INTEGER PRIMARY KEY AUTOINCREMENT, productId INTEGER NOT NULL, imagePath TEXT NOT NULL, sortOrder INTEGER NOT NULL DEFAULT 0, createdAt TEXT NOT NULL DEFAULT (datetime('now')), FOREIGN KEY(productId) REFERENCES products(id) ON DELETE CASCADE)"
  );

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminIdRaw = process.env.ADMIN_ID;

  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const existing = await get("SELECT id FROM users WHERE email = ?", [adminEmail]);

    if (existing) {
      await run("UPDATE users SET role = 'admin', passwordHash = ? WHERE id = ?", [
        passwordHash,
        existing.id
      ]);
    } else if (adminIdRaw && Number.isInteger(Number(adminIdRaw)) && Number(adminIdRaw) > 0) {
      await run(
        "INSERT OR IGNORE INTO users (id, email, passwordHash, role) VALUES (?, ?, ?, 'admin')",
        [Number(adminIdRaw), adminEmail, passwordHash]
      );
      await run("UPDATE users SET role = 'admin', passwordHash = ? WHERE email = ?", [
        passwordHash,
        adminEmail
      ]);
    } else {
      await run("INSERT INTO users (email, passwordHash, role) VALUES (?, ?, 'admin')", [
        adminEmail,
        passwordHash
      ]);
    }
  }
}

module.exports = { initDb };
