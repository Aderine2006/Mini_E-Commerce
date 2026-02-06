const sqlite3 = require("sqlite3");

let db;

function getDb() {
  if (!db) {
    const dbPath = process.env.DB_PATH || "./data/app.sqlite";
    db = new sqlite3.Database(dbPath);
    db.exec("PRAGMA foreign_keys = ON;");
  }
  return db;
}

function run(sql, params = []) {
  const database = getDb();
  return new Promise((resolve, reject) => {
    database.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  const database = getDb();
  return new Promise((resolve, reject) => {
    database.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  const database = getDb();
  return new Promise((resolve, reject) => {
    database.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

module.exports = { getDb, run, get, all };
