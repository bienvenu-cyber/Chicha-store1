const mongoose = require('mongoose');
const axios = require('axios');

class RiskRulesEngine {
  constructor() {
    this.riskThresholds = {
      LOW: { score: 0, maxAmount: 500 },
      MEDIUM: { score: 50, maxAmount: 2000 },
      HIGH: { score: 75, maxAmount: 5000 },
      CRITICAL: { score: 90, maxAmount: 10000 }
    };
  }

  // Évaluation complète des risques
  async assessTransactionRisk(transaction) {
    const riskFactors = await this.calculateRiskFactors(transaction);
    const riskScore = this.computeRiskScore(riskFactors);
    
    return {
      riskScore,
      riskLevel: this.determineRiskLevel(riskScore),
      riskFactors
    };
  }

  // Calcul des facteurs de risque
  async calculateRiskFactors(transaction) {
    const factors = {
      userHistory: await this.evaluateUserHistory(transaction.user),
      deviceRisk: await this.assessDeviceRisk(transaction.deviceFingerprint),
      geographicRisk: this.evaluateGeographicRisk(transaction.ipAddress),
      transactionPattern: this.analyzeTransactionPattern(transaction),
      externalVerifications: await this.checkExternalServices(transaction)
    };

    return factors;
  }

  // Évaluation de l'historique utilisateur
  async evaluateUserHistory(user) {
    const userTransactions = await mongoose.models.Transaction.aggregate([
      { $match: { user: user._id } },
      { 
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          averageAmount: { $avg: '$amount' },
          recentDisputes: { $sum: { $cond: [{ $eq: ['$status', 'disputed'] }, 1, 0] } }
        }
      }
    ]);

    const history = userTransactions[0] || {};
    
    return {
      accountAge: this.calculateAccountAge(user.createdAt),
      totalTransactions: history.totalTransactions || 0,
      averageTransactionAmount: history.averageAmount || 0,
      disputeRatio: history.recentDisputes / (history.totalTransactions || 1),
      riskScore: this.calculateUserHistoryRiskScore(history)
    };
  }

  // Évaluation des risques du dispositif
  async assessDeviceRisk(deviceFingerprint) {
    try {
      const response = await axios.post('https://device-intelligence-api.com/analyze', {
        fingerprint: deviceFingerprint,
        apiKey: process.env.DEVICE_INTEL_API_KEY
      });

      return {
        isNewDevice: response.data.isNewDevice,
        isSuspiciousDevice: response.data.isSuspicious,
        deviceScore: response.data.riskScore
      };
    } catch (error) {
      console.warn('Échec de l\'analyse du dispositif', error);
      return { deviceScore: 50 }; // Score par défaut en cas d'erreur
    }
  }

  // Évaluation des risques géographiques
  evaluateGeographicRisk(ipAddress) {
    // Utiliser une base de données géographique ou un service externe
    const riskCountries = ['NG', 'CM', 'GH', 'KE']; // Exemple
    
    try {
      const geoInfo = this.getGeolocationInfo(ipAddress);
      
      return {
        country: geoInfo.countryCode,
        isHighRiskRegion: riskCountries.includes(geoInfo.countryCode),
        riskScore: this.calculateGeographicRiskScore(geoInfo)
      };
    } catch (error) {
      console.warn('Échec de la géolocalisation', error);
      return { riskScore: 30 }; // Score par défaut
    }
  }

  // Analyse des modèles de transaction
  analyzeTransactionPattern(transaction) {
    const { amount, frequency, paymentMethod } = transaction;
    
    const patterns = {
      unusualAmount: this.isUnusualAmount(amount),
      frequencyAnomaly: this.detectFrequencyAnomaly(frequency),
      methodRisk: this.assessPaymentMethodRisk(paymentMethod)
    };

    return {
      ...patterns,
      riskScore: this.calculatePatternRiskScore(patterns)
    };
  }

  // Vérifications de services externes
  async checkExternalServices(transaction) {
    const services = {
      sanctions: await this.checkSanctionsList(transaction.user),
      creditScore: await this.fetchCreditScore(transaction.user),
      fraudDetection: await this.runFraudCheck(transaction)
    };

    return {
      ...services,
      riskScore: this.calculateExternalServicesRiskScore(services)
    };
  }

  // Calcul du score de risque global
  computeRiskScore(riskFactors) {
    const weights = {
      userHistory: 0.25,
      deviceRisk: 0.2,
      geographicRisk: 0.15,
      transactionPattern: 0.2,
      externalVerifications: 0.2
    };

    return Object.keys(weights).reduce((score, factor) => {
      return score + (riskFactors[factor].riskScore * weights[factor]);
    }, 0);
  }

  // Détermination du niveau de risque
  determineRiskLevel(riskScore) {
    if (riskScore < 25) return 'LOW';
    if (riskScore < 50) return 'MEDIUM';
    if (riskScore < 75) return 'HIGH';
    return 'CRITICAL';
  }

  // Méthodes utilitaires (implémentations simplifiées)
  calculateAccountAge(createdAt) {
    const ageInDays = (Date.now() - createdAt) / (1000 * 60 * 60 * 24);
    return ageInDays;
  }

  calculateUserHistoryRiskScore(history) {
    // Logique de calcul basée sur l'historique
    return 0; // À implémenter
  }

  isUnusualAmount(amount) {
    // Logique de détection d'un montant inhabituel
    return false; // À implémenter
  }

  detectFrequencyAnomaly(frequency) {
    // Logique de détection d'anomalies de fréquence
    return false; // À implémenter
  }

  assessPaymentMethodRisk(paymentMethod) {
    // Logique d'évaluation des risques par méthode de paiement
    return 0; // À implémenter
  }

  async checkSanctionsList(user) {
    // Vérification des listes de sanctions
    return { isOnSanctionsList: false };
  }

  async fetchCreditScore(user) {
    // Récupération du score de crédit
    return { score: 700 };
  }

  async runFraudCheck(transaction) {
    // Vérification de fraude
    return { isFraudulent: false };
  }

  getGeolocationInfo(ipAddress) {
    // Récupération des informations de géolocalisation
    return { countryCode: 'US' };
  }

  calculateGeographicRiskScore(geoInfo) {
    // Calcul du score de risque géographique
    return 0; // À implémenter
  }

  calculatePatternRiskScore(patterns) {
    // Calcul du score de risque basé sur les modèles
    return 0; // À implémenter
  }

  calculateExternalServicesRiskScore(services) {
    // Calcul du score de risque des services externes
    return 0; // À implémenter
  }

  // Méthode principale de prise de décision
  async makeRiskDecision(transaction) {
    const riskAssessment = await this.assessTransactionRisk(transaction);
    
    // Règles de décision complexes
    switch (riskAssessment.riskLevel) {
      case 'LOW':
        return {
          action: 'APPROVE',
          requiresReview: false
        };
      
      case 'MEDIUM':
        return {
          action: 'REVIEW',
          requiresReview: true,
          additionalVerification: true
        };
      
      case 'HIGH':
        return {
          action: 'BLOCK',
          requiresReview: true,
          notifyCompliance: true
        };
      
      case 'CRITICAL':
        return {
          action: 'BLOCK',
          requiresReview: true,
          notifyCompliance: true,
          reportToAuthorities: true
        };
    }
  }
}

module.exports = new RiskRulesEngine();
