const { all, get, run } = require("../database/db");
const { HttpError } = require("../utils/httpError");

function normalizeKeywords(keywords) {
  if (Array.isArray(keywords)) return keywords.join(",");
  if (typeof keywords === "string") return keywords;
  return "";
}

async function getImagesByProductIds(productIds) {
  if (!productIds.length) return new Map();
  const placeholders = productIds.map(() => "?").join(",");
  const rows = await all(
    `SELECT productId, imagePath FROM product_images WHERE productId IN (${placeholders}) ORDER BY sortOrder ASC, id ASC`,
    productIds
  );

  const map = new Map();
  for (const r of rows) {
    const key = String(r.productId);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(r.imagePath);
  }
  return map;
}

async function replaceProductImages(productId, imagePaths) {
  await run("DELETE FROM product_images WHERE productId = ?", [productId]);
  for (let i = 0; i < imagePaths.length; i += 1) {
    await run(
      "INSERT INTO product_images (productId, imagePath, sortOrder) VALUES (?, ?, ?)",
      [productId, imagePaths[i], i]
    );
  }
}

function mapProductRow(row) {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    category: row.category,
    keywords: row.keywords ? row.keywords.split(",").map((k) => k.trim()).filter(Boolean) : [],
    images: [],
    createdBy: row.createdBy,
    createdAt: row.createdAt
  };
}

async function listProducts() {
  const rows = await all(
    "SELECT id, name, price, category, keywords, createdBy, createdAt FROM products ORDER BY id DESC"
  );
  const products = rows.map(mapProductRow);
  const imageMap = await getImagesByProductIds(products.map((p) => p.id));
  for (const p of products) {
    p.images = imageMap.get(String(p.id)) || [];
  }
  return products;
}

async function getProductById(id) {
  const row = await get(
    "SELECT id, name, price, category, keywords, createdBy, createdAt FROM products WHERE id = ?",
    [id]
  );
  if (!row) return null;
  const product = mapProductRow(row);
  const imageMap = await getImagesByProductIds([product.id]);
  product.images = imageMap.get(String(product.id)) || [];
  return product;
}

async function createProduct({ name, price, category, keywords, createdBy, imagePaths = [] }) {
  const kw = normalizeKeywords(keywords);
  if (!kw) throw new HttpError(400, "keywords is required");

  const result = await run(
    "INSERT INTO products (name, price, category, keywords, createdBy) VALUES (?, ?, ?, ?, ?)",
    [name, price, category, kw, createdBy]
  );

  if (imagePaths.length) {
    await replaceProductImages(result.lastID, imagePaths);
  }

  return getProductById(result.lastID);
}

async function updateProduct(id, { name, price, category, keywords, imagePaths }) {
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

  if (Array.isArray(imagePaths)) {
    await replaceProductImages(id, imagePaths);
  }

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
