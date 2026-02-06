const { HttpError } = require("../utils/httpError");

function errorHandler(err, req, res, next) {
  const status = err instanceof HttpError ? err.status : 500;
  const message = err instanceof HttpError ? err.message : "Internal Server Error";

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({ error: message });
}

module.exports = { errorHandler };
