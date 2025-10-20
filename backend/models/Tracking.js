import mongoose from 'mongoose';

const trackingSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  cosmeticId: {
    type: String,
    required: true
  },
  cosmeticName: {
    type: String,
    required: true
  },
  cosmeticType: {
    type: String,
    required: true,
    enum: ['skin', 'emote', 'pickaxe', 'backbling']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notifiedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true 
});

trackingSchema.index({ cosmeticId: 1, isActive: 1 });
trackingSchema.index({ email: 1 });
trackingSchema.index({ createdAt: -1 });

export default mongoose.model('Tracking', trackingSchema);