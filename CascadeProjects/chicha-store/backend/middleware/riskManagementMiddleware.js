const RiskRulesEngine = import('../services/riskRulesEngine');
const CustomRiskRuleService = import('../services/customRiskRuleService');
const { TransactionRisk } = import('../models/TransactionRisk');
const { Notification } = import('../models/Notification');

class RiskManagementMiddleware {
  // Middleware principal de gestion des risques
  static async assessTransactionRisk(req, res, next) {
    try {
      const transaction = {
        user: req.user,
        amount: req.body.amount,
        currency: req.body.currency,
        paymentMethod: req.body.paymentMethod,
        deviceFingerprint: req.get('User-Agent'),
        ipAddress: req.ip
      };

      // Évaluation initiale des risques
      const initialRiskAssessment = await RiskRulesEngine.assessTransactionRisk(transaction);

      // Évaluation avec règles personnalisées
      const enhancedRiskAssessment = await CustomRiskRuleService.enhanceRiskAssessment(transaction);

      // Créer un enregistrement de risque
      const transactionRisk = await TransactionRisk.create({
        user: req.user._id,
        transaction: req.body.orderId,
        riskAssessment: enhancedRiskAssessment.riskAssessment,
        riskDecision: enhancedRiskAssessment.riskDecision
      });

      // Gérer les actions de risque
      await this.handleRiskAction(enhancedRiskAssessment.riskDecision, transactionRisk);

      // Attacher les informations de risque à la requête
      req.riskAssessment = {
        riskRecord: transactionRisk,
        ...enhancedRiskAssessment
      };

      next();
    } catch (error) {
      console.error('Erreur de gestion des risques', error);
      res.status(500).json({ 
        error: 'Échec de l\'évaluation des risques',
        details: error.message 
      });
    }
  }

  // Gestion des actions de risque
  static async handleRiskAction(riskDecision, transactionRisk) {
    switch (riskDecision.action) {
      case 'APPROVE':
        // Aucune action supplémentaire requise
        break;

      case 'REVIEW':
        await this.createReviewNotification(transactionRisk);
        break;

      case 'BLOCK':
        await this.blockTransaction(transactionRisk);
        break;

      case 'ADDITIONAL_VERIFICATION':
        await this.requestAdditionalVerification(transactionRisk);
        break;
    }

    // Actions supplémentaires basées sur les flags
    if (riskDecision.notifyCompliance) {
      await this.notifyComplianceTeam(transactionRisk);
    }

    if (riskDecision.reportToAuthorities) {
      await this.reportToAuthorities(transactionRisk);
    }
  }

  // Créer une notification pour révision
  static async createReviewNotification(transactionRisk) {
    await Notification.create({
      user: transactionRisk.user,
      type: 'RISK_REVIEW',
      title: 'Révision de Transaction Requise',
      message: `Une révision manuelle est nécessaire pour la transaction ${transactionRisk._id}`,
      relatedEntity: {
        type: 'TransactionRisk',
        id: transactionRisk._id
      },
      priority: 'HIGH'
    });
  }

  // Bloquer la transaction
  static async blockTransaction(transactionRisk) {
    // Mettre à jour le statut de la transaction
    await mongoose.models.Transaction.findByIdAndUpdate(
      transactionRisk.transaction,
      { status: 'BLOCKED' }
    );

    await Notification.create({
      user: transactionRisk.user,
      type: 'TRANSACTION_BLOCKED',
      title: 'Transaction Bloquée',
      message: 'Votre transaction a été bloquée pour des raisons de sécurité',
      relatedEntity: {
        type: 'TransactionRisk',
        id: transactionRisk._id
      },
      priority: 'CRITICAL'
    });
  }

  // Demander une vérification supplémentaire
  static async requestAdditionalVerification(transactionRisk) {
    await Notification.create({
      user: transactionRisk.user,
      type: 'ADDITIONAL_VERIFICATION',
      title: 'Vérification Supplémentaire Requise',
      message: 'Nous avons besoin de vérifications supplémentaires pour votre transaction',
      relatedEntity: {
        type: 'TransactionRisk',
        id: transactionRisk._id
      },
      priority: 'HIGH'
    });
  }

  // Notifier l'équipe de conformité
  static async notifyComplianceTeam(transactionRisk) {
    // Trouver les utilisateurs du département de conformité
    const complianceUsers = await mongoose.models.User.find({
      role: 'COMPLIANCE_OFFICER'
    });

    for (const user of complianceUsers) {
      await Notification.create({
        user: user._id,
        type: 'COMPLIANCE_ALERT',
        title: 'Alerte de Conformité',
        message: `Transaction à haut risque détectée : ${transactionRisk._id}`,
        relatedEntity: {
          type: 'TransactionRisk',
          id: transactionRisk._id
        },
        priority: 'CRITICAL'
      });
    }
  }

  // Signaler aux autorités
  static async reportToAuthorities(transactionRisk) {
    try {
      // Logique de signalement aux autorités
      // Peut impliquer un appel à une API gouvernementale
      await this.sendReportToFinancialAuthorities(transactionRisk);
    } catch (error) {
      console.error('Erreur de signalement aux autorités', error);
    }
  }

  // Méthode de signalement (à implémenter selon les réglementations locales)
  static async sendReportToFinancialAuthorities(transactionRisk) {
    // Exemple simplifié
    await axios.post('https://financial-authorities-api.gov/report', {
      transactionId: transactionRisk._id,
      details: transactionRisk.riskAssessment
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.AUTHORITIES_REPORT_TOKEN}`
      }
    });
  }
}

export default = RiskManagementMiddleware;
