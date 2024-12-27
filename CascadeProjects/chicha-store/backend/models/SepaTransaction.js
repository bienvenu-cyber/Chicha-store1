const mongoose = import('mongoose');

const SepaTransactionSchema = new mongoose.Schema({
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
  sepaPaymentId: {
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
    default: 'EUR'
  },
  status: {
    type: String,
    enum: [
      'pending_verification', 
      'pending_mandate', 
      'processing', 
      'completed', 
      'failed', 
      'refunded'
    ],
    default: 'pending_verification'
  },
  bankDetails: {
    iban: {
      type: String,
      required: true
    },
    bic: String,
    accountHolderName: {
      type: String,
      required: true
    }
  },
  mandateReference: String,
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, { 
  timestamps: true,
  indexes: [
    { fields: { user: 1, status: 1 } },
    { fields: { sepaPaymentId: 1 } }
  ]
});

SepaTransactionSchema.statics.createTransaction = async function(
  order, 
  user, 
  iban, 
  accountHolderName, 
  amount, 
  currency = 'EUR',
  bic = null
) {
  const transaction = new this({
    order: order._id,
    user: user._id,
    sepaPaymentId: `SEPA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    amount,
    currency,
    bankDetails: {
      iban,
      bic,
      accountHolderName
    }
  });

  return await transaction.save();
};

export default = mongoose.model('SepaTransaction', SepaTransactionSchema);
