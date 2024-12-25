import axios from 'axios';
import { TransactionRisk } from '../models/TransactionRisk.js.js';

export default class ExternalVerificationService {
  // Services de vérification externes
  static async runComprehensiveVerification(transaction) {
    const verificationResults = await Promise.all([
      this.performSanctionsCheck(transaction),
      this.checkCreditScore(transaction.user),
      this.verifyIdentity(transaction.user),
      this.runFraudDetection(transaction),
      this.checkDeviceIntelligence(transaction)
    ]);

    // Enregistrer les résultats de risque
    await this.recordTransactionRisk(transaction, verificationResults);

    return this.assessOverallRisk(verificationResults);
  }

  // Vérification des listes de sanctions
  static async performSanctionsCheck(transaction) {
    try {
      const response = await axios.post('https://sanctions-api.com/check', {
        name: transaction.user.fullName,
        country: transaction.country,
        apiKey: process.env.SANCTIONS_API_KEY
      });

      return {
        service: 'Sanctions Check',
        status: response.data.isClear ? 'PASS' : 'FAIL',
        details: response.data
      };
    } catch (error) {
      console.error('Sanctions Check Error', error);
      return {
        service: 'Sanctions Check',
        status: 'ERROR',
        details: error.message
      };
    }
  }

  // Vérification du score de crédit
  static async checkCreditScore(user) {
    try {
      const response = await axios.get('https://credit-score-service.com/score', {
        params: {
          userId: user._id,
          apiKey: process.env.CREDIT_SCORE_API_KEY
        }
      });

      return {
        service: 'Credit Score',
        status: response.data.score >= 700 ? 'PASS' : 'REVIEW',
        details: response.data
      };
    } catch (error) {
      console.error('Credit Score Check Error', error);
      return {
        service: 'Credit Score',
        status: 'ERROR',
        details: error.message
      };
    }
  }

  // Vérification d'identité
  static async verifyIdentity(user) {
    try {
      const response = await axios.post('https://identity-verification.com/verify', {
        fullName: user.fullName,
        documentNumber: user.documentId,
        apiKey: process.env.IDENTITY_VERIFY_API_KEY
      });

      return {
        service: 'Identity Verification',
        status: response.data.isVerified ? 'PASS' : 'FAIL',
        details: response.data
      };
    } catch (error) {
      console.error('Identity Verification Error', error);
      return {
        service: 'Identity Verification',
        status: 'ERROR',
        details: error.message
      };
    }
  }

  // Détection de fraude avancée
  static async runFraudDetection(transaction) {
    try {
      const response = await axios.post('https://fraud-detection-service.com/analyze', {
        transaction,
        apiKey: process.env.FRAUD_DETECTION_API_KEY
      });

      return {
        service: 'Fraud Detection',
        status: response.data.riskLevel === 'LOW' ? 'PASS' : 'REVIEW',
        details: response.data
      };
    } catch (error) {
      console.error('Fraud Detection Error', error);
      return {
        service: 'Fraud Detection',
        status: 'ERROR',
        details: error.message
      };
    }
  }

  // Intelligence du dispositif
  static async checkDeviceIntelligence(transaction) {
    try {
      const response = await axios.post('https://device-intelligence.com/analyze', {
        deviceFingerprint: transaction.deviceFingerprint,
        ipAddress: transaction.ipAddress,
        apiKey: process.env.DEVICE_INTEL_API_KEY
      });

      return {
        service: 'Device Intelligence',
        status: response.data.isLegitimate ? 'PASS' : 'REVIEW',
        details: response.data
      };
    } catch (error) {
      console.error('Device Intelligence Error', error);
      return {
        service: 'Device Intelligence',
        status: 'ERROR',
        details: error.message
      };
    }
  }

  // Évaluation globale des risques
  static assessOverallRisk(verificationResults) {
    const riskScores = {
      'PASS': 1,
      'REVIEW': 5,
      'FAIL': 10,
      'ERROR': 8
    };

    const totalRisk = verificationResults.reduce((score, result) => {
      return score + (riskScores[result.status] || 5);
    }, 0);

    const averageRisk = totalRisk / verificationResults.length;

    return {
      overallRiskLevel: 
        averageRisk <= 2 ? 'LOW' :
        averageRisk <= 5 ? 'MEDIUM' :
        averageRisk <= 8 ? 'HIGH' : 'CRITICAL',
      details: verificationResults
    };
  }

  // Enregistrement des risques de transaction
  static async recordTransactionRisk(transaction, verificationResults) {
    const riskRecord = new TransactionRisk({
      transaction: transaction._id,
      user: transaction.user._id,
      verificationResults,
      overallRiskAssessment: this.assessOverallRisk(verificationResults)
    });

    return await riskRecord.save();
  }
}

export default ExternalVerificationService;
