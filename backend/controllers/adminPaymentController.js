import TransactionRisk from '../models/TransactionRisk.js.js';
import PaymentMethod from '../models/PaymentMethod.js.js';
import Country from '../models/Country.js.js';
import Order from '../models/Order.js.js';

class AdminPaymentController {
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
        filter['overallRiskAssessment.overallRiskLevel'] = riskLevel;
      }

      const risks = await TransactionRisk.find(filter)
        .populate('transaction')
        .populate('user', 'fullName email')
        .sort({ createdAt: -1 });

      const riskSummary = await TransactionRisk.aggregate([
        { $match: filter },
        { 
          $group: {
            _id: '$overallRiskAssessment.overallRiskLevel',
            count: { $sum: 1 }
          }
        }
      ]);

      res.json({
        risks,
        summary: riskSummary
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Gestion des méthodes de paiement
  async managePaymentMethods(req, res) {
    try {
      const { action } = req.body;

      switch (action) {
        case 'create':
          const newMethod = await PaymentMethod.create(req.body.methodData);
          res.status(201).json(newMethod);
          break;

        case 'update':
          const updatedMethod = await PaymentMethod.findByIdAndUpdate(
            req.body.methodId, 
            req.body.updateData,
            { new: true }
          );
          res.json(updatedMethod);
          break;

        case 'disable':
          const disabledMethod = await PaymentMethod.findByIdAndUpdate(
            req.body.methodId,
            { isEnabled: false },
            { new: true }
          );
          res.json(disabledMethod);
          break;

        default:
          res.status(400).json({ error: 'Action non valide' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Gestion des pays et réglementations
  async manageCountryRegulations(req, res) {
    try {
      const { action } = req.body;

      switch (action) {
        case 'updateRegulations':
          const updatedCountry = await Country.findByIdAndUpdate(
            req.body.countryId,
            { 
              taxRegime: req.body.taxRegime,
              regulatoryComplexity: req.body.regulatoryComplexity
            },
            { new: true }
          );
          res.json(updatedCountry);
          break;

        case 'addSupportedPaymentMethod':
          const country = await Country.findById(req.body.countryId);
          country.supportedPaymentMethods.push(req.body.paymentMethodId);
          await country.save();
          res.json(country);
          break;

        default:
          res.status(400).json({ error: 'Action non valide' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Révision manuelle des transactions à risque
  async reviewRiskyTransaction(req, res) {
    try {
      const { 
        transactionRiskId, 
        action, 
        reviewNotes 
      } = req.body;

      const riskRecord = await TransactionRisk.findById(transactionRiskId);

      if (!riskRecord) {
        return res.status(404).json({ error: 'Transaction à risque non trouvée' });
      }

      riskRecord.actionTaken = action;
      riskRecord.reviewedBy = req.user._id;
      riskRecord.reviewNotes = reviewNotes;

      await riskRecord.save();

      // Actions supplémentaires basées sur la décision
      switch (action) {
        case 'APPROVED':
          await Order.findByIdAndUpdate(
            riskRecord.transaction, 
            { paymentStatus: 'confirmed' }
          );
          break;
        case 'BLOCKED':
          await Order.findByIdAndUpdate(
            riskRecord.transaction, 
            { paymentStatus: 'cancelled' }
          );
          break;
      }

      res.json(riskRecord);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new AdminPaymentController();
