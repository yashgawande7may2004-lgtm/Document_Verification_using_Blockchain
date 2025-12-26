const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs");

const router = express.Router();

// Multer config (store file temporarily)
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("document"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Read file
    const fileBuffer = fs.readFileSync(req.file.path);

    // Generate SHA-256 hash
    const hash = crypto
      .createHash("sha256")
      .update(fileBuffer)
      .digest("hex");

    // Delete temp file
    fs.unlinkSync(req.file.path);

    return res.status(200).json({
      message: "Hash generated successfully",
      hash: hash,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
