const { run, all } = require("../database/db");

async function trackActivity({ userId, productId, type }) {
  await run(
    "INSERT INTO user_activity (userId, productId, type) VALUES (?, ?, ?)",
    [userId, productId, type]
  );
}

async function getUserViewedProductIds(userId) {
  const rows = await all(
    "SELECT DISTINCT productId FROM user_activity WHERE userId = ? AND type = 'viewed' ORDER BY createdAt DESC",
    [userId]
  );
  return rows.map((r) => String(r.productId));
}

async function getUserCartAddProductIds(userId) {
  const rows = await all(
    "SELECT DISTINCT productId FROM user_activity WHERE userId = ? AND type = 'cart_add' ORDER BY createdAt DESC",
    [userId]
  );
  return rows.map((r) => String(r.productId));
}

module.exports = {
  trackActivity,
  getUserViewedProductIds,
  getUserCartAddProductIds
};
