import mongoose from "mongoose";

export default new mongoose.Schema({
  name: { type: String },
  project: { type: mongoose.Types.ObjectId, ref: "Project" },
  file: { type: mongoose.Types.ObjectId, ref: "File" },
  sessionId: { type: mongoose.Types.ObjectId },
  fileType: { type: String },
  error: { type: String },
  hasConverted: { type: Boolean, default: false },
  startedAt: { type: Date },
  finishedAt: { type: Date },
  hasErrored: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Types.ObjectId, ref: "User" },
  updatedAt: { type: Date },
  updatedBy: { type: mongoose.Types.ObjectId, ref: "User" },
});
