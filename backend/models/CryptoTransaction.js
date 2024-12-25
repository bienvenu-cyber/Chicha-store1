import mongoose from 'mongoose';

const CryptoTransactionSchema = new mongoose.Schema({
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
  cryptoChargeId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  cryptocurrency: {
    type: String,
    enum: [
      'BTC', 
      'ETH', 
      'USDT', 
      'USDC', 
      'BNB', 
      'XRP', 
      'ADA'
    ],
    required: true
  },
  fiatCurrency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: [
      'pending', 
      'confirmed', 
      'completed', 
      'failed', 
      'refunded'
    ],
    default: 'pending'
  },
  transactionHash: String,
  walletAddress: String,
  exchangeRate: Number,
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, { 
  timestamps: true,
  indexes: [
    { fields: { user: 1, status: 1 } },
    { fields: { cryptoChargeId: 1 } }
  ]
});

CryptoTransactionSchema.statics.createTransaction = async function(
  order, 
  user, 
  cryptocurrency, 
  amount, 
  fiatCurrency = 'USD'
) {
  const transaction = new this({
    order: order._id,
    user: user._id,
    cryptocurrency,
    amount,
    fiatCurrency,
    cryptoChargeId: `CRYPTO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  });

  return await transaction.save();
};

export default mongoose.model('CryptoTransaction', CryptoTransactionSchema);
