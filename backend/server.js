require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose"); 
const axios = require("axios"); 

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

// 3. IPFS Rollback Route
app.post("/api/unpin", async (req, res) => {
  const { cid } = req.body;
  const pinataJWT = process.env.PINATA_JWT;

  if (!cid || !pinataJWT) {
    return res.status(400).json({ message: "Missing CID or JWT" });
  }

  try {
    await axios.delete(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
      headers: { Authorization: `Bearer ${pinataJWT}` }
    });
    console.log(`✅ Server successfully unpinned: ${cid}`);
    return res.status(200).json({ message: "File unpinned successfully" });
  } catch (error) {
    console.error("❌ Pinata Unpin Error:", error.response ? error.response.data : error.message);
    return res.status(500).json({ message: "Failed to unpin file" });
  }
});

// ============================================
// 👇 NEW ADDITIONS FOR AUDIT LOGS 👇
// ============================================

// 4. DEFINE VERIFICATION LOG SCHEMA
const logSchema = new mongoose.Schema({
  documentHash: { type: String, required: true },
  verifierWallet: { type: String, default: "Anonymous" }, 
  timestamp: { type: Date, default: Date.now },
  status: { type: String, default: "Success" } 
});

// Create the Model
const VerificationLog = mongoose.model("VerificationLog", logSchema);

// 5. NEW ROUTES FOR LOGS

// A. SAVE LOG (Called by Verifier Page)
app.post("/api/log-verification", async (req, res) => {
  try {
    const { hash, wallet, status } = req.body;
    
    // Create new log entry
    const newLog = new VerificationLog({ 
        documentHash: hash, 
        verifierWallet: wallet || "Anonymous",
        status: status
    });
    
    await newLog.save();
    console.log(`📝 Logged verification for ${hash}`);
    res.json({ message: "Log saved" });

  } catch (err) {
    console.error("Log Error:", err);
    res.status(500).json({ error: "Failed to log" });
  }
});

// B. GET LOGS (Called by Issuer Page History)
app.get("/api/logs/:hash", async (req, res) => {
  try {
    // Find logs for this specific document hash, newest first
    const logs = await VerificationLog.find({ documentHash: req.params.hash }).sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

// ============================================
// 👆 END NEW ADDITIONS 👆
// ============================================

const dbURI = process.env.MONGO_URI;

mongoose.connect(dbURI)
  .then(() => {
    console.log("✅ Connected to MongoDB Cloud (Atlas)");
  })
  .catch((err) => {
    console.error("❌ Connection Error:", err.message);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});