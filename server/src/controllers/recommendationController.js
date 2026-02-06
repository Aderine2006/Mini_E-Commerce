const { asyncHandler } = require("../utils/asyncHandler");
const { HttpError } = require("../utils/httpError");
const { recommendProductsForUser } = require("../services/recommendationService");

const getRecommendations = asyncHandler(async (req, res) => {
  const userIdRaw = req.query.userId;
  const userId = Number(userIdRaw);
  if (!userIdRaw || !Number.isInteger(userId) || userId <= 0) {
    throw new HttpError(400, "userId query param is required");
  }

  const requester = req.user;
  const isAdmin = requester.role === "admin";
  if (!isAdmin && requester.userId !== userId) {
    throw new HttpError(403, "You can only request your own recommendations");
  }

  const result = await recommendProductsForUser(userId);
  res.json({ products: result.products });
});

module.exports = { getRecommendations };
