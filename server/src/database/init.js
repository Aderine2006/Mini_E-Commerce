const fs = require("fs");
const path = require("path");
const { run } = require("./db");

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
}

module.exports = { initDb };
