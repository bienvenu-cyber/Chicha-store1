const mongoose = import('mongoose');

const MobileMoneyTransactionSchema = new mongoose.Schema({
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
  provider: {
    type: String,
    enum: [
      'mpesa', 
      'orangeMoney', 
      'mtnMobileMoney', 
      'moovMoney', 
      'celtisCash', 
      'wave', 
      'expresso', 
      'wizall', 
      'joni', 
      'emoney'
    ],
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  transactionId: {
    type: String,
    unique: true,
    required: true
  },
  status: {
    type: String,
    enum: [
      'pending', 
      'initiated', 
      'processing', 
      'completed', 
      'failed', 
      'cancelled'
    ],
    default: 'pending'
  },
  ussdCode: {
    type: String
  },
  confirmationCode: {
    type: String
  },
  paymentDate: {
    type: Date
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  errorDetails: {
    type: String
  }
}, {
  timestamps: true,
  indexes: [
    { fields: { user: 1, status: 1 } },
    { fields: { provider: 1, status: 1 } }
  ]
});

// Méthode statique pour créer une transaction
MobileMoneyTransactionSchema.statics.createTransaction = async function(
  order, 
  user, 
  provider, 
  phoneNumber, 
  amount
) {
  const transaction = new this({
    order: order._id,
    user: user._id,
    provider,
    phoneNumber,
    amount,
    transactionId: `${provider.toUpperCase()}_${Date.now()}`,
    ussdCode: this.generateUSSDCode(provider)
  });

  return await transaction.save();
};

// Générer un code USSD par défaut
MobileMoneyTransactionSchema.statics.generateUSSDCode = function(provider) {
  const ussdCodes = {
    'mtnMobileMoney': '*133#',
    'orangeMoney': '*144#',
    'moovMoney': '*155#',
    'celtisCash': '*161#',
    'wave': '*170#',
    'expresso': '*180#',
    'wizall': '*190#',
    'joni': '*200#',
    'emoney': '*210#'
  };

  return ussdCodes[provider] || '*100#';
};

export default = mongoose.model('MobileMoneyTransaction', MobileMoneyTransactionSchema);
