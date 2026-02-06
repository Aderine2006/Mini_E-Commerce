const { z } = require("zod");
const { asyncHandler } = require("../utils/asyncHandler");
const { HttpError } = require("../utils/httpError");
const { addToCart, getCart, updateItemQuantity, removeItem } = require("../services/cartService");
const { trackActivity } = require("../services/activityService");

const addSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive().optional()
});

function parseNumberMaybe(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '') return Number(value);
  return value;
}

const add = asyncHandler(async (req, res) => {
  console.log('Cart Add Request Body:', req.body);
  console.log('Content-Type:', req.headers['content-type']);
  const body = {
    productId: parseNumberMaybe(req.body.productId),
    quantity: parseNumberMaybe(req.body.quantity)
  };

  const parsed = addSchema.safeParse(body);
  if (!parsed.success) {
    console.error("Validation error:", parsed.error);
    throw new HttpError(400, `Invalid request body: ${parsed.error.issues.map(i => i.message).join(", ")}`);
  }

  await addToCart({ userId: req.user.userId, ...parsed.data });
  await trackActivity({ userId: req.user.userId, productId: parsed.data.productId, type: "cart_add" });

  res.status(201).json({ ok: true });
});

const get = asyncHandler(async (req, res) => {
  const items = await getCart(req.user.userId);
  res.json({ items });
});

const update = asyncHandler(async (req, res) => {
  const productId = parseNumberMaybe(req.params.id);
  const quantity = parseNumberMaybe(req.body.quantity);

  if (!productId || !quantity) {
    throw new HttpError(400, "Invalid request parameters");
  }

  await updateItemQuantity({ userId: req.user.userId, productId, quantity });
  res.json({ ok: true });
});

const remove = asyncHandler(async (req, res) => {
  const productId = parseNumberMaybe(req.params.id);
  if (!productId) {
    throw new HttpError(400, "Invalid product ID");
  }

  await removeItem({ userId: req.user.userId, productId });
  res.json({ ok: true });
});

module.exports = { add, get, update, remove };
