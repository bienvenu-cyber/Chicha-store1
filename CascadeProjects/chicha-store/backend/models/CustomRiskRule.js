const mongoose = import('mongoose');

const CustomRiskRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  riskType: {
    type: String,
    enum: [
      'USER_HISTORY', 
      'DEVICE', 
      'GEOGRAPHIC', 
      'TRANSACTION_PATTERN', 
      'EXTERNAL_SERVICE'
    ],
    required: true
  },
  conditions: [{
    field: String,
    operator: {
      type: String,
      enum: [
        'EQUALS', 
        'NOT_EQUALS', 
        'GREATER_THAN', 
        'LESS_THAN', 
        'CONTAINS', 
        'NOT_CONTAINS'
      ]
    },
    value: mongoose.Schema.Types.Mixed
  }],
  riskScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  action: {
    type: String,
    enum: [
      'APPROVE', 
      'REVIEW', 
      'BLOCK', 
      'ADDITIONAL_VERIFICATION'
    ],
    default: 'REVIEW'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { 
  timestamps: true,
  indexes: [
    { fields: { riskType: 1, isActive: 1 } },
    { fields: { riskScore: 1 } }
  ]
});

// Méthode statique pour évaluer une règle personnalisée
CustomRiskRuleSchema.statics.evaluateRule = async function(transaction, ruleId) {
  const rule = await this.findById(ruleId);
  
  if (!rule || !rule.isActive) {
    return { 
      matches: false, 
      riskScore: 0 
    };
  }

  const matches = rule.conditions.every(condition => {
    const transactionValue = this.getTransactionValue(transaction, condition.field);
    
    switch (condition.operator) {
      case 'EQUALS':
        return transactionValue === condition.value;
      case 'NOT_EQUALS':
        return transactionValue !== condition.value;
      case 'GREATER_THAN':
        return transactionValue > condition.value;
      case 'LESS_THAN':
        return transactionValue < condition.value;
      case 'CONTAINS':
        return transactionValue.includes(condition.value);
      case 'NOT_CONTAINS':
        return !transactionValue.includes(condition.value);
    }
  });

  return {
    matches,
    riskScore: matches ? rule.riskScore : 0
  };
};

// Méthode utilitaire pour extraire la valeur de transaction
CustomRiskRuleSchema.statics.getTransactionValue = (transaction, field) => {
  const fieldMap = {
    'user.country': transaction.user.country,
    'amount': transaction.amount,
    'paymentMethod': transaction.paymentMethod,
    'deviceFingerprint': transaction.deviceFingerprint,
    'ipAddress': transaction.ipAddress
  };

  return fieldMap[field];
};

export default = mongoose.model('CustomRiskRule', CustomRiskRuleSchema);
