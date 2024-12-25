import mongoose from 'mongoose';

const StripeTransactionSchema = new mongoose.Schema({
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
  stripePaymentIntentId: {
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
    default: 'usd'
  },
  status: {
    type: String,
    enum: [
      'requires_payment_method',
      'requires_confirmation',
      'requires_action',
      'processing',
      'succeeded',
      'requires_capture',
      'canceled'
    ],
    default: 'requires_payment_method'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'sepa_debit', 'apple_pay', 'google_pay']
  },
  cardBrand: String,
  cardLast4: String,
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, { 
  timestamps: true,
  indexes: [
    { fields: { user: 1, status: 1 } },
    { fields: { stripePaymentIntentId: 1 } }
  ]
});

StripeTransactionSchema.statics.createTransaction = async function(
  order, 
  user, 
  stripePaymentIntentId, 
  amount, 
  currency = 'usd',
  paymentMethod = 'card'
) {
  const transaction = new this({
    order: order._id,
    user: user._id,
    stripePaymentIntentId,
    amount,
    currency,
    paymentMethod
  });

  return await transaction.save();
};

export default mongoose.model('StripeTransaction', StripeTransactionSchema);
