const CustomRiskRuleService = require('../services/customRiskRuleService');
const { TransactionRisk } = require('../models/TransactionRisk');
const { CustomRiskRule } = require('../models/CustomRiskRule');

class RiskAdminController {
  // Créer une nouvelle règle de risque personnalisée
  async createCustomRiskRule(req, res) {
    try {
      const ruleData = req.body;
      const createdBy = req.user._id;

      const newRule = await CustomRiskRuleService.createCustomRule(
        ruleData, 
        createdBy
      );

      res.status(201).json({
        message: 'Règle de risque créée avec succès',
        rule: newRule
      });
    } catch (error) {
      res.status(400).json({ 
        error: 'Impossible de créer la règle de risque',
        details: error.message 
      });
    }
  }

  // Mettre à jour une règle de risque existante
  async updateCustomRiskRule(req, res) {
    try {
      const { ruleId } = req.params;
      const updateData = req.body;

      const updatedRule = await CustomRiskRuleService.updateCustomRule(
        ruleId, 
        updateData
      );

      res.json({
        message: 'Règle de risque mise à jour avec succès',
        rule: updatedRule
      });
    } catch (error) {
      res.status(400).json({ 
        error: 'Impossible de mettre à jour la règle de risque',
        details: error.message 
      });
    }
  }

  // Désactiver une règle de risque
  async disableCustomRiskRule(req, res) {
    try {
      const { ruleId } = req.params;

      const disabledRule = await CustomRiskRuleService.disableCustomRule(ruleId);

      res.json({
        message: 'Règle de risque désactivée avec succès',
        rule: disabledRule
      });
    } catch (error) {
      res.status(400).json({ 
        error: 'Impossible de désactiver la règle de risque',
        details: error.message 
      });
    }
  }

  // Obtenir toutes les règles de risque personnalisées
  async getAllCustomRiskRules(req, res) {
    try {
      const { 
        riskType, 
        isActive 
      } = req.query;

      const filters = {};
      if (riskType) filters.riskType = riskType;
      if (isActive !== undefined) filters.isActive = isActive === 'true';

      const customRules = await CustomRiskRuleService.getAllCustomRules(filters);

      res.json({
        rules: customRules,
        total: customRules.length
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Impossible de récupérer les règles de risque',
        details: error.message 
      });
    }
  }

  // Tableau de bord des risques de transaction
  async getTransactionRiskDashboard(req, res) {
    try {
      const { 
        startDate, 
        endDate, 
        riskLevel 
      } = req.query;

      const filter = {
        createdAt: {
          $gte: new Date(startDate || Date.now() - 30 * 24 * 60 * 60 * 1000),
          $lte: new Date(endDate || Date.now())
        }
      };

      if (riskLevel) {
        filter['riskAssessment.riskLevel'] = riskLevel;
      }

      // Agrégation pour le tableau de bord
      const riskSummary = await TransactionRisk.aggregate([
        { $match: filter },
        { 
          $group: {
            _id: '$riskAssessment.riskLevel',
            count: { $sum: 1 },
            totalAmount: { $sum: '$transaction.amount' }
          }
        },
        { $sort: { count: -1 } }
      ]);

      // Détails des transactions à risque
      const riskTransactions = await TransactionRisk.find(filter)
        .populate('user', 'fullName email')
        .populate('transaction')
        .sort({ createdAt: -1 })
        .limit(50);

      res.json({
        summary: riskSummary,
        transactions: riskTransactions
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Impossible de générer le tableau de bord des risques',
        details: error.message 
      });
    }
  }

  // Analyser une transaction spécifique
  async analyzeSpecificTransaction(req, res) {
    try {
      const { transactionId } = req.params;

      const transactionRisk = await TransactionRisk.findById(transactionId)
        .populate('user')
        .populate('transaction');

      if (!transactionRisk) {
        return res.status(404).json({ error: 'Transaction à risque non trouvée' });
      }

      // Récupérer les règles personnalisées qui ont correspondu
      const matchedCustomRules = await CustomRiskRule.find({
        _id: { $in: transactionRisk.riskAssessment.customRules.map(r => r.ruleId) }
      });

      res.json({
        transactionRisk,
        matchedCustomRules
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Impossible d\'analyser la transaction',
        details: error.message 
      });
    }
  }
}

module.exports = new RiskAdminController();
