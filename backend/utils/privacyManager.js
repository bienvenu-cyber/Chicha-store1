import crypto from 'crypto';

export default class PrivacyManager {
  // Hachage des données personnelles
  static hashPersonalData(data) {
    return crypto
      .createHash('sha256')
      .update(data + process.env.SALT_KEY)
      .digest('hex');
  }

  // Anonymisation des données
  static anonymizeData(user) {
    return {
      id: this.hashPersonalData(user._id.toString()),
      segments: user.segments || [],
      purchaseHistory: user.purchaseHistory 
        ? user.purchaseHistory.map(purchase => ({
            category: purchase.category,
            totalSpent: purchase.totalSpent
          })) 
        : []
    };
  }

  // Gestion du consentement
  static createConsentRecord(user, purposes) {
    return {
      userId: user._id,
      purposes: purposes.map(purpose => ({
        name: purpose,
        consentGiven: true,
        timestamp: new Date()
      })),
      revocationToken: crypto.randomBytes(32).toString('hex')
    };
  }

  // Vérification du consentement
  static checkConsent(consentRecord, purpose) {
    return consentRecord.purposes.some(
      p => p.name === purpose && p.consentGiven
    );
  }

  // Génération de données agrégées
  static generateAggregatedData(users) {
    return {
      totalUsers: users.length,
      userSegments: this.calculateSegmentDistribution(users),
      averagePurchaseValue: this.calculateAveragePurchaseValue(users)
    };
  }

  // Calcul de la distribution des segments
  static calculateSegmentDistribution(users) {
    const segments = {};
    
    users.forEach(user => {
      const segment = user.segment || 'unclassified';
      segments[segment] = (segments[segment] || 0) + 1;
    });

    return segments;
  }

  // Calcul de la valeur moyenne d'achat
  static calculateAveragePurchaseValue(users) {
    const totalPurchaseValue = users.reduce((sum, user) => {
      const userTotal = user.purchaseHistory 
        ? user.purchaseHistory.reduce((total, purchase) => total + purchase.totalSpent, 0)
        : 0;
      return sum + userTotal;
    }, 0);

    return totalPurchaseValue / users.length;
  }

  // Suppression des données personnelles
  static async deletePersonalData(user) {
    // Anonymisation et suppression des données
    user.email = this.hashPersonalData(user.email);
    user.name = 'Utilisateur Supprimé';
    user.isActive = false;
    user.deletedAt = new Date();

    // Suppression des données sensibles
    user.tokens = [];
    user.purchaseHistory = [];

    await user.save();
  }

  // Génération de rapport de confidentialité
  static generatePrivacyReport(user) {
    return {
      dataCollected: [
        'Email',
        'Nom',
        'Historique d\'achat',
        'Préférences marketing'
      ],
      thirdPartySharing: [
        'Plateformes publicitaires',
        'Services d\'analyse'
      ],
      lastUpdated: new Date(),
      consentStatus: this.checkAllConsents(user)
    };
  }

  // Vérification globale des consentements
  static checkAllConsents(user) {
    const purposes = [
      'marketing', 
      'analytics', 
      'personalization'
    ];

    return purposes.every(purpose => 
      this.checkConsent(user.consentRecord, purpose)
    );
  }
}

export default PrivacyManager;
