const { all, get } = require("../database/db");
const { generateText } = require("./geminiService");
const { extractFirstJsonObject } = require("../utils/jsonExtract");

function buildGeminiPrompt({ viewedProducts, cartProducts, allProducts }) {
  return `You are an AI recommendation engine for an e-commerce application.

User context:
- Previously viewed products:
${JSON.stringify(viewedProducts, null, 2)}

- Products currently in cart:
${JSON.stringify(cartProducts, null, 2)}

Available products:
${JSON.stringify(allProducts, null, 2)}

Each product includes:
- id
- name
- category
- keywords

Rules:
1. Recommend products relevant to the user's interests
2. Use keyword and category similarity
3. Do NOT recommend products already viewed or in cart
4. Prefer accessories or complementary items
5. Recommend exactly 3 products

Return ONLY valid JSON in this format:
{
  "recommendedProducts": ["id1", "id2", "id3"]
}

No explanation.
No markdown.
No extra text.`;
}

function toPromptProduct(p) {
  return {
    id: String(p.id),
    name: p.name,
    category: p.category,
    keywords: p.keywords ? p.keywords.split(",").map((k) => k.trim()).filter(Boolean) : []
  };
}

async function fetchAllProductsForPrompt() {
  const rows = await all("SELECT id, name, category, keywords FROM products ORDER BY id DESC");
  return rows.map(toPromptProduct);
}

async function fetchProductsByIds(ids) {
  if (!ids.length) return [];
  const placeholders = ids.map(() => "?").join(",");
  const rows = await all(
    `SELECT id, name, price, category, keywords, createdBy, createdAt FROM products WHERE id IN (${placeholders})`,
    ids
  );

  const map = new Map(rows.map((r) => [String(r.id), r]));
  return ids
    .map((id) => map.get(String(id)))
    .filter(Boolean)
    .map((r) => ({
      id: r.id,
      name: r.name,
      price: r.price,
      category: r.category,
      keywords: r.keywords ? r.keywords.split(",").map((k) => k.trim()).filter(Boolean) : [],
      createdBy: r.createdBy,
      createdAt: r.createdAt
    }));
}

async function getUserContextProducts(userId) {
  const viewedRows = await all(
    "SELECT productId, MAX(createdAt) as lastSeen FROM user_activity WHERE userId = ? AND type = 'viewed' GROUP BY productId ORDER BY lastSeen DESC LIMIT 20",
    [userId]
  );
  const cartRows = await all(
    "SELECT productId, MAX(createdAt) as lastAdded FROM user_activity WHERE userId = ? AND type = 'cart_add' GROUP BY productId ORDER BY lastAdded DESC LIMIT 20",
    [userId]
  );

  const viewedIds = viewedRows.map((r) => String(r.productId));
  const cartIds = cartRows.map((r) => String(r.productId));

  const allIds = Array.from(new Set([...viewedIds, ...cartIds]));
  const products = await fetchProductsByIds(allIds);
  const map = new Map(products.map((p) => [String(p.id), p]));

  return {
    viewedProducts: viewedIds.map((id) => map.get(id)).filter(Boolean).map((p) => ({
      id: String(p.id),
      name: p.name,
      category: p.category,
      keywords: p.keywords
    })),
    cartProducts: cartIds.map((id) => map.get(id)).filter(Boolean).map((p) => ({
      id: String(p.id),
      name: p.name,
      category: p.category,
      keywords: p.keywords
    })),
    excludeIds: new Set([...viewedIds, ...cartIds])
  };
}

function validateGeminiRecommendationJson(json, excludeIds) {
  if (!json || typeof json !== "object") return null;
  const arr = json.recommendedProducts;
  if (!Array.isArray(arr)) return null;

  const cleaned = arr
    .map((x) => (x == null ? "" : String(x).trim()))
    .filter(Boolean)
    .filter((id) => !excludeIds.has(id));

  const unique = Array.from(new Set(cleaned));
  if (unique.length < 3) return null;

  return unique.slice(0, 3);
}

async function getPopularFallback({ excludeIds, limit = 3 }) {
  const rows = await all(
    "SELECT productId, COUNT(*) as score FROM user_activity GROUP BY productId ORDER BY score DESC LIMIT 50"
  );

  const picked = [];
  for (const r of rows) {
    const id = String(r.productId);
    if (excludeIds.has(id)) continue;
    picked.push(id);
    if (picked.length === limit) break;
  }

  if (picked.length < limit) {
    const recent = await all("SELECT id FROM products ORDER BY id DESC LIMIT 50");
    for (const r of recent) {
      const id = String(r.id);
      if (excludeIds.has(id)) continue;
      if (picked.includes(id)) continue;
      picked.push(id);
      if (picked.length === limit) break;
    }
  }

  return picked.slice(0, limit);
}

async function recommendProductsForUser(userId) {
  const userExists = await get("SELECT id FROM users WHERE id = ?", [userId]);
  if (!userExists) {
    return { products: [] };
  }

  const { viewedProducts, cartProducts, excludeIds } = await getUserContextProducts(userId);
  const allProducts = await fetchAllProductsForPrompt();

  const prompt = buildGeminiPrompt({ viewedProducts, cartProducts, allProducts });

  let recommendedIds;
  try {
    const text = await generateText(prompt);
    const json = extractFirstJsonObject(text);
    const valid = validateGeminiRecommendationJson(json, excludeIds);
    if (!valid) throw new Error("Invalid Gemini JSON response");
    recommendedIds = valid;
  } catch {
    recommendedIds = await getPopularFallback({ excludeIds, limit: 3 });
  }

  const products = await fetchProductsByIds(recommendedIds);
  return { products };
}

module.exports = { recommendProductsForUser };
