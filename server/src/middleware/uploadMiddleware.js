const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safeOriginal = (file.originalname || "file")
      .toLowerCase()
      .replace(/[^a-z0-9.\-_]/g, "-")
      .slice(0, 120);

    const ext = path.extname(safeOriginal) || ".bin";
    const base = path.basename(safeOriginal, ext);
    cb(null, `${Date.now()}-${Math.random().toString(16).slice(2)}-${base}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype || !file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image uploads are allowed"));
  }
  return cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    files: 10,
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = { upload };
