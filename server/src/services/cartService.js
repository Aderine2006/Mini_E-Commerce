const { all, get, run } = require("../database/db");
const { HttpError } = require("../utils/httpError");

async function addToCart({ userId, productId, quantity }) {
  const product = await get("SELECT id FROM products WHERE id = ?", [productId]);
  if (!product) throw new HttpError(404, "Product not found");

  const qty = quantity ?? 1;
  if (!Number.isInteger(qty) || qty <= 0) throw new HttpError(400, "quantity must be a positive integer");

  await run(
    "INSERT INTO cart_items (userId, productId, quantity) VALUES (?, ?, ?) ON CONFLICT(userId, productId) DO UPDATE SET quantity = quantity + excluded.quantity",
    [userId, productId, qty]
  );
}

async function getCart(userId) {
  const rows = await all(
    "SELECT ci.productId, ci.quantity, p.name, p.price, p.category, p.keywords FROM cart_items ci JOIN products p ON p.id = ci.productId WHERE ci.userId = ? ORDER BY ci.id DESC",
    [userId]
  );

  const items = rows.map((r) => ({
    product: {
      id: r.productId,
      name: r.name,
      price: r.price,
      category: r.category,
      keywords: r.keywords ? r.keywords.split(",").map((k) => k.trim()).filter(Boolean) : []
    },
    quantity: r.quantity
  }));

  return items;
}

async function getCartProductIds(userId) {
  const rows = await all("SELECT productId FROM cart_items WHERE userId = ?", [userId]);
  return rows.map((r) => String(r.productId));
}

module.exports = { addToCart, getCart, getCartProductIds };
