const mongoose = import('mongoose');

const SecurityLogSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'login_attempt', 
      'password_change', 
      'account_lockout', 
      'suspicious_activity',
      'permission_change',
      'two_factor_auth'
    ],
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: { expires: '30d' } // Suppression après 30 jours
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  }
}, {
  timestamps: true
});

// Index pour les recherches rapides
SecurityLogSchema.index({ userId: 1, type: 1, timestamp: -1 });

// Méthode statique pour créer un log de sécurité
SecurityLogSchema.statics.createLog = async function(
  type, 
  userId = null, 
  details = {}, 
  ipAddress = null, 
  userAgent = null,
  severity = 'low'
) {
  try {
    const log = new this({
      type,
      userId,
      details,
      ipAddress,
      userAgent,
      severity
    });

    return await log.save();
  } catch (error) {
    console.error('Erreur de création de log de sécurité', error);
    return null;
  }
};

// Méthode statique pour vérifier les activités suspectes
SecurityLogSchema.statics.checkSuspiciousActivity = async function(userId) {
  const recentLogs = await this.find({
    userId,
    type: 'login_attempt',
    timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // 24 heures
  });

  const failedAttempts = recentLogs.filter(log => 
    log.details.success === false
  );

  return {
    totalAttempts: recentLogs.length,
    failedAttempts: failedAttempts.length,
    isSuspicious: failedAttempts.length > 5
  };
};

export default = mongoose.model('SecurityLog', SecurityLogSchema);
