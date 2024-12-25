import mongoose from 'mongoose';

const ApplePayTransactionSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applePayTokenId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: [
      'initiated', 
      'processing', 
      'completed', 
      'failed', 
      'refunded'
    ],
    default: 'initiated'
  },
  deviceType: {
    type: String,
    enum: ['iphone', 'ipad', 'mac', 'apple_watch']
  },
  paymentNetwork: {
    type: String,
    enum: ['visa', 'mastercard', 'amex', 'discover']
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, { 
  timestamps: true,
  indexes: [
    { fields: { user: 1, status: 1 } },
    { fields: { applePayTokenId: 1 } }
  ]
});

ApplePayTransactionSchema.statics.createTransaction = async function(
  order, 
  user, 
  applePayTokenId, 
  amount, 
  currency = 'USD',
  deviceType = 'iphone'
) {
  const transaction = new this({
    order: order._id,
    user: user._id,
    applePayTokenId,
    amount,
    currency,
    deviceType
  });

  return await transaction.save();
};

export default mongoose.model('ApplePayTransaction', ApplePayTransactionSchema);
