const { z } = require("zod");
const { asyncHandler } = require("../utils/asyncHandler");
const { HttpError } = require("../utils/httpError");
const { addToCart, getCart } = require("../services/cartService");
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
  const body = {
    productId: parseNumberMaybe(req.body.productId),
    quantity: parseNumberMaybe(req.body.quantity)
  };

  const parsed = addSchema.safeParse(body);
  if (!parsed.success) throw new HttpError(400, "Invalid request body");

  await addToCart({ userId: req.user.userId, ...parsed.data });
  await trackActivity({ userId: req.user.userId, productId: parsed.data.productId, type: "cart_add" });

  res.status(201).json({ ok: true });
});

const get = asyncHandler(async (req, res) => {
  const items = await getCart(req.user.userId);
  res.json({ items });
});

module.exports = { add, get };
