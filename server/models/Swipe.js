import mongoose from 'mongoose';

const swipeSchema = new mongoose.Schema({
  voter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  photo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Photo',
    required: true
  },
  photoOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  direction: {
    type: String,
    enum: ['like', 'skip'],
    required: true
  },
  reaction: {
    type: String,
    enum: ['love', 'fire', 'smile', 'thumbsUp', 'sparkles'],
    default: null
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate votes
swipeSchema.index({ voter: 1, photo: 1 }, { unique: true });

export default mongoose.model('Swipe', swipeSchema);