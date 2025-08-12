import mongoose from 'mongoose';

const photoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required']
  },
  cloudinaryId: {
    type: String,
    required: true
  },
  caption: {
    type: String,
    maxlength: [300, 'Caption cannot exceed 300 characters'],
    default: ''
  },
  likes: {
    type: Number,
    default: 0
  },
  skips: {
    type: Number,
    default: 0
  },
  reactions: {
    love: { type: Number, default: 0 },
    fire: { type: Number, default: 0 },
    smile: { type: Number, default: 0 },
    thumbsUp: { type: Number, default: 0 },
    sparkles: { type: Number, default: 0 }
  },
  totalSwipes: {
    type: Number,
    default: 0
  },
  score: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  reportCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate score based on interactions
photoSchema.methods.calculateScore = function() {
  const likeWeight = 2;
  const reactionWeight = 1.5;
  const totalReactions = Object.values(this.reactions).reduce((sum, count) => sum + count, 0);
  
  this.score = (this.likes * likeWeight) + (totalReactions * reactionWeight);
  return this.score;
};

export default mongoose.model('Photo', photoSchema);