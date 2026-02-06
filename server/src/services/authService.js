const jwt = require("jsonwebtoken");

function signJwt({ userId, role }) {
  const secret = process.env.JWT_SECRET || "change_me";
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign({ userId, role }, secret, { expiresIn });
}

module.exports = { signJwt };
