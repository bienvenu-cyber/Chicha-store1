const express = require('express');
const router = express.Router();
const adsPlatformService = require('../services/adsPlatformService');
const { authenticateUser } = require('../middleware/authMiddleware');

// Créer une audience de remarketing
router.post('/remarketing/audience', authenticateUser, async (req, res) => {
  try {
    const { userData } = req.body;
    const audiences = await adsPlatformService.createRemarketingAudience(userData);
    res.status(201).json(audiences);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Créer une campagne de remarketing
router.post('/remarketing/campaign', authenticateUser, async (req, res) => {
  try {
    const { productData } = req.body;
    const campaigns = await adsPlatformService.createRemarkentingCampaign(productData);
    res.status(201).json(campaigns);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Suivre une conversion
router.post('/conversion/track', authenticateUser, async (req, res) => {
  try {
    const { conversionData } = req.body;
    await adsPlatformService.trackConversion(conversionData);
    res.status(200).json({ message: 'Conversion suivie avec succès' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
