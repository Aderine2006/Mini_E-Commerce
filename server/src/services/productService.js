const { all, get, run } = require("../database/db");
const { HttpError } = require("../utils/httpError");

function normalizeKeywords(keywords) {
  if (Array.isArray(keywords)) return keywords.join(",");
  if (typeof keywords === "string") return keywords;
  return "";
}

function mapProductRow(row) {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    category: row.category,
    keywords: row.keywords ? row.keywords.split(",").map((k) => k.trim()).filter(Boolean) : [],
    createdBy: row.createdBy,
    createdAt: row.createdAt
  };
}

async function listProducts() {
  const rows = await all(
    "SELECT id, name, price, category, keywords, createdBy, createdAt FROM products ORDER BY id DESC"
  );
  return rows.map(mapProductRow);
}

async function getProductById(id) {
  const row = await get(
    "SELECT id, name, price, category, keywords, createdBy, createdAt FROM products WHERE id = ?",
    [id]
  );
  return row ? mapProductRow(row) : null;
}

async function createProduct({ name, price, category, keywords, createdBy }) {
  const kw = normalizeKeywords(keywords);
  if (!kw) throw new HttpError(400, "keywords is required");

  const result = await run(
    "INSERT INTO products (name, price, category, keywords, createdBy) VALUES (?, ?, ?, ?, ?)",
    [name, price, category, kw, createdBy]
  );

  return getProductById(result.lastID);
}

async function updateProduct(id, { name, price, category, keywords }) {
  const existing = await getProductById(id);
  if (!existing) throw new HttpError(404, "Product not found");

  const next = {
    name: name ?? existing.name,
    price: price ?? existing.price,
    category: category ?? existing.category,
    keywords: keywords ?? existing.keywords
  };

  const kw = normalizeKeywords(next.keywords);

  await run(
    "UPDATE products SET name = ?, price = ?, category = ?, keywords = ? WHERE id = ?",
    [next.name, next.price, next.category, kw, id]
  );

  return getProductById(id);
}

async function deleteProduct(id) {
  const result = await run("DELETE FROM products WHERE id = ?", [id]);
  if (result.changes === 0) throw new HttpError(404, "Product not found");
}

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
