const { z } = require("zod");
const { asyncHandler } = require("../utils/asyncHandler");
const { HttpError } = require("../utils/httpError");
const { createUser, verifyUserCredentials } = require("../services/userService");
const { signJwt } = require("../services/authService");

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["user", "admin"]).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const register = asyncHandler(async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, "Invalid request body");

  const role = parsed.data.role || "user";
  const user = await createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    role
  });

  const token = signJwt({ userId: user.id, role: user.role });
  res.status(201).json({ token, user });
});

const login = asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, "Invalid request body");

  const user = await verifyUserCredentials(parsed.data);
  const token = signJwt({ userId: user.id, role: user.role });
  res.json({ token, user });
});

module.exports = { register, login };
