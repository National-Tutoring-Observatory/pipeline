import mongoose from "mongoose";

export default new mongoose.Schema({
  name: { type: String },
  project: { type: mongoose.Types.ObjectId, ref: "Project" },
  runSet: { type: mongoose.Types.ObjectId, ref: "RunSet" },
  baseRun: { type: mongoose.Types.ObjectId, ref: "Run" },
  runs: [{ type: mongoose.Types.ObjectId, ref: "Run" }],
  annotationFields: [{ type: String }],
  isRunning: { type: Boolean, default: false },
  isComplete: { type: Boolean, default: false },
  hasErrored: { type: Boolean, default: false },
  startedAt: { type: Date },
  finishedAt: { type: Date },
  report: [{ type: mongoose.Schema.Types.Mixed }],
  isExporting: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Types.ObjectId, ref: "User" },
  updatedAt: { type: Date },
  updatedBy: { type: mongoose.Types.ObjectId, ref: "User" },
});
