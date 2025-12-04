import mongoose from 'mongoose';

export default new mongoose.Schema({
  action: { type: String, required: true },
  user: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  team: { type: mongoose.Types.ObjectId, ref: 'Team' },
  context: { type: Map },
  createdAt: { type: Date, default: Date.now }
});
