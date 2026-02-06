const express = require("express");
const { getAll, getOne, create, update, remove } = require("../controllers/productController");
const { authMiddleware, optionalAuthMiddleware } = require("../middleware/authMiddleware");
const { adminMiddleware } = require("../middleware/adminMiddleware");
const { upload } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", getAll);
router.get("/:id", optionalAuthMiddleware, getOne);
router.post("/", authMiddleware, adminMiddleware, upload.array("images", 10), create);
router.put("/:id", authMiddleware, adminMiddleware, upload.array("images", 10), update);
router.delete("/:id", authMiddleware, adminMiddleware, remove);

module.exports = router;
