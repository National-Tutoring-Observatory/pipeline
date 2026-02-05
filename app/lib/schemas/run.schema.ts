import mongoose from "mongoose";

export default new mongoose.Schema({
  name: { type: String, required: true },
  project: { type: mongoose.Types.ObjectId, ref: "Project", required: true },
  annotationType: {
    type: String,
    enum: ["PER_UTTERANCE", "PER_SESSION"],
    required: true,
  },
  prompt: { type: mongoose.Types.ObjectId, ref: "Prompt", required: true },
  promptVersion: { type: Number, required: true },
  sessions: [
    {
      sessionId: {
        type: mongoose.Types.ObjectId,
        ref: "Session",
        required: true,
      },
      status: { type: String, required: true },
      name: { type: String, required: true },
      fileType: { type: String },
      startedAt: { type: Date, default: Date.now },
      finishedAt: { type: Date, default: Date.now },
    },
  ],
  snapshot: {
    prompt: {
      name: { type: String, required: true },
      userPrompt: { type: String, required: true },
      annotationSchema: [mongoose.Schema.Types.Mixed],
      annotationType: { type: String, required: true },
      version: { type: Number, required: true },
    },
    model: {
      code: { type: String, required: true },
      name: { type: String, required: true },
      provider: { type: String, required: true },
    },
  },
  isRunning: { type: Boolean, default: false },
  isComplete: { type: Boolean, default: false },
  hasErrored: { type: Boolean, default: false },
  isExporting: { type: Boolean, default: false },
  hasExportedCSV: { type: Boolean, default: false },
  hasExportedJSONL: { type: Boolean, default: false },
  startedAt: { type: Date },
  finishedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Types.ObjectId, ref: "User" },
  updatedAt: { type: Date },
  updatedBy: { type: mongoose.Types.ObjectId, ref: "User" },
});
