const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { add, get } = require("../controllers/cartController");

const router = express.Router();

router.post("/", authMiddleware, add);
router.get("/", authMiddleware, get);

module.exports = router;
