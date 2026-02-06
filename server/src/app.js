const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const path = require("path");

const { errorHandler } = require("./middleware/errorHandler");
const { swaggerSpec } = require("./docs/swagger");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(morgan("dev"));
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (req, res) => res.json({ ok: true }));

  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  app.get("/docs.json", (req, res) => res.json(swaggerSpec));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use("/auth", authRoutes);
  app.use("/products", productRoutes);
  app.use("/cart", cartRoutes);
  app.use("/recommendations", recommendationRoutes);

  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
