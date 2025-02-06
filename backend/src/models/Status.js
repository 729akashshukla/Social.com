import mongoose from 'mongoose';

const statusSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, trim: true },
  mediaUrl: { type: String, trim: true },
  expiresAt: { 
    type: Date, 
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    index: { expires: '24h' }  // Auto-delete after 24 hours
  }
}, { timestamps: true });

const Status = mongoose.model('Status', statusSchema);
export default Status;
