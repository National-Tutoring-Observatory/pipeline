import mongoose from 'mongoose';

export default new mongoose.Schema({
  name: { type: String },
  project: { type: mongoose.Types.ObjectId, ref: 'Project' },
  annotationType: { type: String, enum: ['PER_UTTERANCE', 'PER_SESSION'] },
  prompt: { type: mongoose.Types.ObjectId, ref: 'Prompt' },
  promptVersion: { type: Number },
  model: { type: String },
  sessions: [{
    sessionId: { type: mongoose.Types.ObjectId, ref: 'Session' },
    status: { type: String },
    name: { type: String },
    fileType: { type: String },
    startedAt: { type: Date, default: Date.now },
    finishedAt: { type: Date, default: Date.now }
  }],
  hasSetup: { type: Boolean, default: false },
  isRunning: { type: Boolean, default: false },
  isComplete: { type: Boolean, default: false },
  hasErrored: { type: Boolean, default: false },
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