import CustomRiskRule from '../models/CustomRiskRule.js.js';
import RiskRulesEngine from './riskRulesEngine.js.js.js';

export default class CustomRiskRuleService {
  // Créer une nouvelle règle de risque personnalisée
  async createCustomRule(ruleData, createdBy) {
    try {
      const newRule = new CustomRiskRule({
        ...ruleData,
        createdBy
      });

      await newRule.save();
      return newRule;
    } catch (error) {
      throw new Error(`Impossible de créer la règle de risque : ${error.message}`);
    }
  }

  // Mettre à jour une règle de risque existante
  async updateCustomRule(ruleId, updateData) {
    try {
      const updatedRule = await CustomRiskRule.findByIdAndUpdate(
        ruleId, 
        updateData, 
        { new: true }
      );

      if (!updatedRule) {
        throw new Error('Règle de risque non trouvée');
      }

      return updatedRule;
    } catch (error) {
      throw new Error(`Impossible de mettre à jour la règle de risque : ${error.message}`);
    }
  }

  // Évaluer une transaction avec toutes les règles personnalisées
  async evaluateTransactionWithCustomRules(transaction) {
    try {
      // Récupérer toutes les règles actives
      const activeRules = await CustomRiskRule.find({ 
        isActive: true 
      }).sort({ priority: -1 });

      let totalCustomRiskScore = 0;
      const matchedRules = [];

      // Évaluer chaque règle
      for (const rule of activeRules) {
        const ruleEvaluation = await CustomRiskRule.evaluateRule(
          transaction, 
          rule._id
        );

        if (ruleEvaluation.matches) {
          totalCustomRiskScore += ruleEvaluation.riskScore;
          matchedRules.push({
            ruleId: rule._id,
            ruleName: rule.name,
            riskScore: ruleEvaluation.riskScore
          });
        }
      }

      return {
        totalCustomRiskScore,
        matchedRules
      };
    } catch (error) {
      console.error('Erreur lors de l\'évaluation des règles personnalisées', error);
      return { 
        totalCustomRiskScore: 0, 
        matchedRules: [] 
      };
    }
  }

  // Intégrer les règles personnalisées dans l'évaluation globale des risques
  async enhanceRiskAssessment(transaction) {
    try {
      // Obtenir l'évaluation initiale des risques
      const initialRiskAssessment = await RiskRulesEngine.assessTransactionRisk(transaction);

      // Évaluer les règles personnalisées
      const customRulesResult = await this.evaluateTransactionWithCustomRules(transaction);

      // Ajuster le score de risque
      const adjustedRiskScore = initialRiskAssessment.riskScore + 
        (customRulesResult.totalCustomRiskScore * 0.5); // Pondération ajustable

      const enhancedRiskAssessment = {
        ...initialRiskAssessment,
        riskScore: adjustedRiskScore,
        riskLevel: RiskRulesEngine.determineRiskLevel(adjustedRiskScore),
        customRules: customRulesResult.matchedRules
      };

      // Prendre la décision finale
      const riskDecision = await RiskRulesEngine.makeRiskDecision({
        ...transaction,
        riskAssessment: enhancedRiskAssessment
      });

      return {
        riskAssessment: enhancedRiskAssessment,
        riskDecision
      };
    } catch (error) {
      console.error('Erreur lors de l\'amélioration de l\'évaluation des risques', error);
      throw error;
    }
  }

  // Désactiver une règle de risque
  async disableCustomRule(ruleId) {
    try {
      const updatedRule = await CustomRiskRule.findByIdAndUpdate(
        ruleId, 
        { isActive: false }, 
        { new: true }
      );

      if (!updatedRule) {
        throw new Error('Règle de risque non trouvée');
      }

      return updatedRule;
    } catch (error) {
      throw new Error(`Impossible de désactiver la règle de risque : ${error.message}`);
    }
  }

  // Obtenir toutes les règles de risque personnalisées
  async getAllCustomRules(filters = {}) {
    try {
      return await CustomRiskRule.find(filters)
        .sort({ priority: -1 })
        .populate('createdBy', 'fullName email');
    } catch (error) {
      throw new Error(`Impossible de récupérer les règles de risque : ${error.message}`);
    }
  }
}

export default new CustomRiskRuleService();
