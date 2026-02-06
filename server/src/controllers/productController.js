const { z } = require("zod");
const { asyncHandler } = require("../utils/asyncHandler");
const { HttpError } = require("../utils/httpError");
const {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require("../services/productService");
const { trackActivity } = require("../services/activityService");

const createSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  category: z.string().min(1),
  keywords: z.union([z.array(z.string().min(1)), z.string().min(1)])
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  category: z.string().min(1).optional(),
  keywords: z.union([z.array(z.string().min(1)), z.string().min(1)]).optional()
});

const getAll = asyncHandler(async (req, res) => {
  const products = await listProducts();
  res.json({ products });
});

const getOne = asyncHandler(async (req, res) => {
  const product = await getProductById(Number(req.params.id));
  if (!product) throw new HttpError(404, "Product not found");

  if (req.user?.userId) {
    await trackActivity({ userId: req.user.userId, productId: product.id, type: "viewed" });
  }

  res.json({ product });
});

const create = asyncHandler(async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, "Invalid request body");

  const product = await createProduct({ ...parsed.data, createdBy: req.user.userId });
  res.status(201).json({ product });
});

const update = asyncHandler(async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, "Invalid request body");

  const product = await updateProduct(Number(req.params.id), parsed.data);
  res.json({ product });
});

const remove = asyncHandler(async (req, res) => {
  await deleteProduct(Number(req.params.id));
  res.json({ ok: true });
});

module.exports = { getAll, getOne, create, update, remove };
