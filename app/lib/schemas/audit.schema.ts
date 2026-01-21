import mongoose from "mongoose";

export default new mongoose.Schema({
  action: { type: String, required: true },
  performedBy: { type: mongoose.Types.ObjectId, ref: "User" },
  performedByUsername: { type: String, required: true },
  context: { type: Map, required: true, default: {} },
  createdAt: { type: Date, required: true, default: Date.now },
});
