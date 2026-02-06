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

function parseKeywordsFromBody(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  if (!trimmed) return trimmed;

  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      return parsed;
    } catch {
      return trimmed;
    }
  }

  return trimmed;
}

function parseNumberMaybe(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return value;
}

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
  const body = {
    ...req.body,
    price: parseNumberMaybe(req.body.price),
    keywords: parseKeywordsFromBody(req.body.keywords)
  };

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) throw new HttpError(400, "Invalid request body");

  const imagePaths = Array.isArray(req.files)
    ? req.files.map((f) => `/uploads/${f.filename}`)
    : [];

  const product = await createProduct({
    ...parsed.data,
    createdBy: req.user.userId,
    imagePaths
  });
  res.status(201).json({ product });
});

const update = asyncHandler(async (req, res) => {
  const body = {
    ...req.body,
    price: req.body.price === undefined ? undefined : parseNumberMaybe(req.body.price),
    keywords: req.body.keywords === undefined ? undefined : parseKeywordsFromBody(req.body.keywords)
  };

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) throw new HttpError(400, "Invalid request body");

  const imagePaths = Array.isArray(req.files)
    ? req.files.map((f) => `/uploads/${f.filename}`)
    : undefined;

  const product = await updateProduct(Number(req.params.id), {
    ...parsed.data,
    imagePaths
  });
  res.json({ product });
});

const remove = asyncHandler(async (req, res) => {
  await deleteProduct(Number(req.params.id));
  res.json({ ok: true });
});

module.exports = { getAll, getOne, create, update, remove };
