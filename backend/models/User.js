const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["issuer", "verifier"], default: "verifier" },
});

module.exports = mongoose.model("User", UserSchema);