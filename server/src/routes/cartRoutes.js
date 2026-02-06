const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { add, get, update, remove } = require("../controllers/cartController");

const router = express.Router();

router.post("/", authMiddleware, add);
router.get("/", authMiddleware, get);
router.put("/:id", authMiddleware, update);
router.delete("/:id", authMiddleware, remove);

module.exports = router;
