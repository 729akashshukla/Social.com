const statusSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    mediaUrl: String,
    expiresAt: { type: Date, index: { expires: 0 } } // Auto-delete after 24h
  }, { timestamps: true });