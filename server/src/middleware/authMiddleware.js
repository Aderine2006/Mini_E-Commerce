const jwt = require("jsonwebtoken");
const { HttpError } = require("../utils/httpError");

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(new HttpError(401, "Missing Authorization header"));
  }

  const token = header.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "change_me");
    req.user = { userId: payload.userId, role: payload.role };
    return next();
  } catch (e) {
    return next(new HttpError(401, "Invalid token"));
  }
}

function optionalAuthMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return next();

  const token = header.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "change_me");
    req.user = { userId: payload.userId, role: payload.role };
  } catch (e) {
    req.user = undefined;
  }
  return next();
}

module.exports = { authMiddleware, optionalAuthMiddleware };
