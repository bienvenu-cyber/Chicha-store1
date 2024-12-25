import mongoose from 'mongoose';

const PayPalTransactionSchema = new mongoose.Schema({
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
  paypalOrderId: {
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
      'created', 
      'approved', 
      'completed', 
      'cancelled', 
      'failed'
    ],
    default: 'created'
  },
  paymentMethod: {
    type: String,
    enum: ['paypal_account', 'credit_card', 'venmo']
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, { 
  timestamps: true,
  indexes: [
    { fields: { user: 1, status: 1 } },
    { fields: { paypalOrderId: 1 } }
  ]
});

PayPalTransactionSchema.statics.createTransaction = async function(
  order, 
  user, 
  paypalOrderId, 
  amount, 
  currency = 'USD'
) {
  const transaction = new this({
    order: order._id,
    user: user._id,
    paypalOrderId,
    amount,
    currency
  });

  return await transaction.save();
};

export default mongoose.model('PayPalTransaction', PayPalTransactionSchema);
