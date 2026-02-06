const { HttpError } = require("../utils/httpError");

function adminMiddleware(req, res, next) {
  if (!req.user) return next(new HttpError(401, "Unauthorized"));
  if (req.user.role !== "admin") return next(new HttpError(403, "Admin access required"));
  return next();
}

module.exports = { adminMiddleware };
