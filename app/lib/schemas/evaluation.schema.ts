import mongoose from "mongoose";

export default new mongoose.Schema({
  name: { type: String },
  project: { type: mongoose.Types.ObjectId, ref: "Project" },
  runSet: { type: mongoose.Types.ObjectId, ref: "Collection" },
  baseRun: { type: mongoose.Types.ObjectId, ref: "Run" },
  runs: [{ type: mongoose.Types.ObjectId, ref: "Run" }],
  annotationFields: [{ type: String }],
  isExporting: { type: Boolean, default: false },
  hasExportedCSV: { type: Boolean, default: false },
  hasExportedJSONL: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Types.ObjectId, ref: "User" },
  updatedAt: { type: Date },
  updatedBy: { type: mongoose.Types.ObjectId, ref: "User" },
});
