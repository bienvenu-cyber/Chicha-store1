import ExternalVerificationService from '../services/externalVerificationService.js.js';
import CountryPaymentService from '../services/countryPaymentService.js.js';
import { TransactionRisk } from '../models/TransactionRisk.js.js';

export default class PaymentValidationMiddleware {
  // Middleware principal de validation de paiement
  static async validatePayment(req, res, next) {
    try {
      const { 
        orderId, 
        paymentMethod, 
        amount, 
        currency 
      } = req.body;

      // Récupérer les informations de l'utilisateur et de la commande
      const user = req.user;
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ error: 'Commande non trouvée' });
      }

      // Vérification de la conformité pays
      await CountryPaymentService.checkRegulatoryCompliance({
        country: user.country,
        amount,
        paymentMethod
      });

      // Préparer la transaction pour vérification
      const transactionData = {
        user,
        order,
        amount,
        currency,
        paymentMethod,
        ipAddress: req.ip,
        deviceFingerprint: req.get('User-Agent')
      };

      // Vérification externe complète
      const verificationResults = await ExternalVerificationService.runComprehensiveVerification(
        transactionData
      );

      // Évaluation du risque
      const riskAssessment = ExternalVerificationService.assessOverallRisk(
        verificationResults
      );

      // Enregistrer le risque de transaction
      const transactionRisk = await TransactionRisk.createRiskRecord(
        order, 
        verificationResults, 
        riskAssessment
      );

      // Décision basée sur le niveau de risque
      switch (riskAssessment.overallRiskLevel) {
        case 'LOW':
          // Autoriser immédiatement
          req.paymentValidation = {
            status: 'APPROVED',
            riskRecord: transactionRisk
          };
          next();
          break;

        case 'MEDIUM':
          // Nécessite une vérification supplémentaire
          req.paymentValidation = {
            status: 'REVIEW',
            riskRecord: transactionRisk
          };
          next();
          break;

        case 'HIGH':
        case 'CRITICAL':
          // Bloquer la transaction
          return res.status(403).json({
            error: 'Transaction bloquée pour des raisons de sécurité',
            riskDetails: transactionRisk
          });
      }
    } catch (error) {
      console.error('Erreur de validation de paiement', error);
      res.status(500).json({ 
        error: 'Échec de la validation de paiement',
        details: error.message 
      });
    }
  }

  // Middleware pour les méthodes de paiement spécifiques
  static async validateSpecificPaymentMethod(req, res, next) {
    const { paymentMethod } = req.body;

    try {
      // Vérifications spécifiques par méthode de paiement
      switch (paymentMethod) {
        case 'credit_card':
          await this.validateCreditCard(req.body);
          break;
        case 'sepa_debit':
          await this.validateSepaDebit(req.body);
          break;
        case 'mobile_money':
          await this.validateMobileMoney(req.body);
          break;
        case 'crypto':
          await this.validateCryptoPayment(req.body);
          break;
      }

      next();
    } catch (error) {
      res.status(400).json({ 
        error: 'Validation de méthode de paiement échouée',
        details: error.message 
      });
    }
  }

  // Validation spécifique pour carte de crédit
  static async validateCreditCard(paymentData) {
    const { cardNumber, expiryDate, cvv } = paymentData;
    
    // Validation de base
    if (!this.isValidCreditCardNumber(cardNumber)) {
      throw new Error('Numéro de carte invalide');
    }

    if (!this.isValidExpiryDate(expiryDate)) {
      throw new Error('Date d\'expiration invalide');
    }

    if (!this.isValidCVV(cvv)) {
      throw new Error('CVV invalide');
    }
  }

  // Validation SEPA
  static async validateSepaDebit(paymentData) {
    const { iban, bic } = paymentData;
    
    if (!this.isValidIBAN(iban)) {
      throw new Error('IBAN invalide');
    }

    if (bic && !this.isValidBIC(bic)) {
      throw new Error('BIC invalide');
    }
  }

  // Méthodes utilitaires de validation
  static isValidCreditCardNumber(number) {
    // Algorithme de Luhn
    return /^[0-9]{13,19}$/.test(number.replace(/\s/g, ''));
  }

  static isValidExpiryDate(date) {
    const [month, year] = date.split('/');
    const expiry = new Date(`20${year}`, month - 1);
    return expiry > new Date();
  }

  static isValidCVV(cvv) {
    return /^[0-9]{3,4}$/.test(cvv);
  }

  static isValidIBAN(iban) {
    return /^[A-Z]{2}\d{2}[A-Z0-9]{4,}$/.test(iban.replace(/\s/g, ''));
  }

  static isValidBIC(bic) {
    return /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(bic);
  }
}

export default PaymentValidationMiddleware;
