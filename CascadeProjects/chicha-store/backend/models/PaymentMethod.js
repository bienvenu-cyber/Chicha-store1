const mongoose = import('mongoose');

const PaymentMethodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: [
      'credit_card', 
      'debit_card', 
      'bank_transfer', 
      'mobile_money', 
      'digital_wallet', 
      'cryptocurrency'
    ],
    required: true
  },
  provider: {
    type: String,
    required: true
  },
  supportedCurrencies: [{
    type: String,
    uppercase: true
  }],
  countriesSupported: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Country'
  }],
  feeStructure: {
    flatFee: Number,
    percentageFee: Number,
    minimumFee: Number,
    maximumFee: Number
  },
  processingTime: {
    min: Number,  // En heures
    max: Number
  },
  securityLevel: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  requiresVerification: Boolean,
  isInternational: Boolean,
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  indexes: [
    { fields: { type: 1 } },
    { fields: { provider: 1 } }
  ]
});

// Méthode statique pour ajouter une méthode de paiement
PaymentMethodSchema.statics.addPaymentMethod = async function(methodData) {
  const method = new this(methodData);
  return await method.save();
};

// Méthode pour obtenir les méthodes par type
PaymentMethodSchema.statics.getMethodsByType = async function(type) {
  return await this.find({ type }).select('name provider');
};

export default = mongoose.model('PaymentMethod', PaymentMethodSchema);
