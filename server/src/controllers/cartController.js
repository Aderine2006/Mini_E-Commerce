const { z } = require("zod");
const { asyncHandler } = require("../utils/asyncHandler");
const { HttpError } = require("../utils/httpError");
const { addToCart, getCart } = require("../services/cartService");
const { trackActivity } = require("../services/activityService");

const addSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive().optional()
});

const add = asyncHandler(async (req, res) => {
  const parsed = addSchema.safeParse(req.body);
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
