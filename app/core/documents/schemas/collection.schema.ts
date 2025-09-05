import mongoose from 'mongoose';

export default new mongoose.Schema({
  name: { type: String },
  project: { type: mongoose.Types.ObjectId, ref: 'Project' },
  sessions: [{ type: mongoose.Types.ObjectId, ref: 'Session' }],
  runs: [{ type: mongoose.Types.ObjectId, ref: 'Run' }],
  hasSetup: { type: Boolean, default: false },
  isExporting: { type: Boolean, default: false },
  hasExportedCSV: { type: Boolean, default: false },
  hasExportedJSONL: { type: Boolean, default: false },
  startedAt: { type: Date, default: Date.now },
  finishedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date },
  updatedBy: { type: mongoose.Types.ObjectId, ref: 'User' }
});