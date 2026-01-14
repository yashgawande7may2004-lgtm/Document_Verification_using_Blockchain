require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose"); 
const axios = require("axios"); // <--- Added for Pinata communication


// IMPORT ROUTES
const uploadRoute = require("./routes/upload");
const authRoute = require("./routes/auth"); 

const app = express();

app.use(cors());
app.use(express.json());

// --- ROUTES ---

// 1. File Upload & Hashing Route
app.use("/api", uploadRoute);

// 2. Authentication Routes (Login/Register)
app.use("/api/auth", authRoute);

// 3. NEW: IPFS Rollback Route (Fixes CORS Issue)
app.post("/api/unpin", async (req, res) => {
  const { cid } = req.body;
// SECURITY UPGRADE: Read key from .env instead of req.body
  const pinataJWT = process.env.PINATA_JWT;

  if (!cid || !pinataJWT) {
    return res.status(400).json({ message: "Missing CID or JWT" });
  }

  try {
    // Server-to-Server call to Pinata (No CORS restrictions)
    await axios.delete(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
      headers: {
        Authorization: `Bearer ${pinataJWT}`
      }
    });
    console.log(`✅ Server successfully unpinned: ${cid}`);
    return res.status(200).json({ message: "File unpinned successfully" });
    
  } catch (error) {
    // Log the error detail from Pinata if available
    console.error("❌ Pinata Unpin Error:", error.response ? error.response.data : error.message);
    return res.status(500).json({ message: "Failed to unpin file" });
  }
});

const dbURI = process.env.MONGO_URI;

mongoose.connect(dbURI)
  .then(() => {
    console.log("✅ Connected to MongoDB Cloud (Atlas)");
  })
  .catch((err) => {
    console.error("❌ Connection Error:", err.message);
  });

// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});