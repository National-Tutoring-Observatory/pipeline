import mongoose from 'mongoose'

export default new mongoose.Schema({
  migrationId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'running', 'completed', 'failed'], required: true },
  startedAt: { type: Date, required: true },
  completedAt: { type: Date },
  triggeredBy: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  jobId: { type: String, required: true },
  result: {
    success: { type: Boolean },
    message: { type: String },
    stats: { type: Map, of: Number }
  },
  error: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
})
