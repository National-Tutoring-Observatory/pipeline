import mongoose from 'mongoose';

export default new mongoose.Schema({
  username: { type: String, default: '' },
  role: { type: String, enum: ['SUPER_ADMIN', 'USER'] },
  teams: [{
    team: { type: mongoose.Types.ObjectId, ref: 'Team' },
    role: { type: String, enum: ['ADMIN'] }
  }],
  isRegistered: { type: Boolean, default: false },
  inviteId: { type: String },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date },
  updatedBy: { type: mongoose.Types.ObjectId, ref: 'User' }
});