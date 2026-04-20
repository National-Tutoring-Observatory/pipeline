import mongoose from "mongoose";

export default new mongoose.Schema({
  team: { type: mongoose.Types.ObjectId, ref: "Team", required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  role: { type: String, enum: ["MEMBER"], default: "MEMBER" },
  maxUses: { type: Number, required: true, min: 1, max: 500 },
  usedCount: { type: Number, default: 0, min: 0 },
  revokedAt: { type: Date },
  revokedBy: { type: mongoose.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Types.ObjectId, ref: "User" },
  updatedAt: { type: Date },
  updatedBy: { type: mongoose.Types.ObjectId, ref: "User" },
});
