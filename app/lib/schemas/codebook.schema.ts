import mongoose from "mongoose";

export default new mongoose.Schema({
  team: { type: mongoose.Types.ObjectId, ref: "Team" },
  name: { type: String },
  description: { type: String, default: "" },
  productionVersion: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Types.ObjectId, ref: "User" },
  updatedAt: { type: Date },
  updatedBy: { type: mongoose.Types.ObjectId, ref: "User" },
  deletedAt: { type: Date },
});
