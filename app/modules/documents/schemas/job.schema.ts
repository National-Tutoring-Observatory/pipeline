import mongoose from 'mongoose';

export default new mongoose.Schema({
  state: {
    type: String,
    enum: ['wait', 'active', 'completed', 'failed', 'delayed', 'waiting-children'],
    default: 'wait'
  },
  queue: { type: String, enum: ['tasks', 'cron'] },
  name: { type: String },
  data: {},
  opts: {},
  timestamp: { type: Date, default: Date.now },
  processedOn: { type: Date },
  finishedOn: { type: Date },
  returnvalue: {},
  failedReason: { type: String },
  stacktrace: { type: String },
  attemptsMade: { type: Number, default: 0 }
});
