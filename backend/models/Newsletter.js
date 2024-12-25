import mongoose from 'mongoose';

const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide']
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  source: {
    type: String,
    enum: ['website', 'popup', 'checkout', 'social'],
    default: 'website'
  },
  segments: [{
    type: String,
    enum: ['new_users', 'regular_buyers', 'high_value', 'inactive']
  }],
  lastEmailSent: {
    type: Date
  },
  unsubscribeToken: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

newsletterSchema.index({ email: 1 }, { unique: true });

export default mongoose.model('Newsletter', newsletterSchema);
