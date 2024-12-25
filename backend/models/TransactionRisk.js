import mongoose from 'mongoose';

const TransactionRiskSchema = new mongoose.Schema({
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  verificationResults: [{
    service: String,
    status: {
      type: String,
      enum: ['PASS', 'REVIEW', 'FAIL', 'ERROR']
    },
    details: mongoose.Schema.Types.Mixed
  }],
  overallRiskAssessment: {
    overallRiskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    },
    details: mongoose.Schema.Types.Mixed
  },
  actionTaken: {
    type: String,
    enum: [
      'APPROVED', 
      'MANUAL_REVIEW', 
      'BLOCKED', 
      'ADDITIONAL_VERIFICATION'
    ]
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNotes: String
}, { 
  timestamps: true,
  indexes: [
    { fields: { user: 1, overallRiskAssessment: 1 } },
    { fields: { transaction: 1 } }
  ]
});

TransactionRiskSchema.statics.createRiskRecord = async function(
  transaction, 
  verificationResults, 
  overallRiskAssessment
) {
  const riskRecord = new this({
    transaction: transaction._id,
    user: transaction.user._id,
    verificationResults,
    overallRiskAssessment
  });

  return await riskRecord.save();
};

export default mongoose.model('TransactionRisk', TransactionRiskSchema);
