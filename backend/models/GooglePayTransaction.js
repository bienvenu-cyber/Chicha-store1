const mongoose = require('mongoose');

const GooglePayTransactionSchema = new mongoose.Schema({
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
  googlePayTokenId: {
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
    enum: ['android_phone', 'android_tablet', 'android_wear']
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
    { fields: { googlePayTokenId: 1 } }
  ]
});

GooglePayTransactionSchema.statics.createTransaction = async function(
  order, 
  user, 
  googlePayTokenId, 
  amount, 
  currency = 'USD',
  deviceType = 'android_phone'
) {
  const transaction = new this({
    order: order._id,
    user: user._id,
    googlePayTokenId,
    amount,
    currency,
    deviceType
  });

  return await transaction.save();
};

module.exports = mongoose.model('GooglePayTransaction', GooglePayTransactionSchema);
