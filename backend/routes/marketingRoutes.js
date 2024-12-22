const express = require('express');
const router = express.Router();
const newsletterService = require('../services/newsletterService');
const loyaltyService = require('../services/loyaltyService');
const remarketingService = require('../services/remarketingService');
const { authenticateUser } = require('../middleware/authMiddleware');

// Newsletter
router.post('/newsletter/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    const subscription = await newsletterService.subscribeEmail(email);
    res.status(201).json(subscription);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/newsletter/unsubscribe/:token', async (req, res) => {
  try {
    const { token } = req.params;
    await newsletterService.unsubscribeEmail(token);
    res.status(200).json({ message: 'Désabonnement réussi' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Programme de Fidélité
router.get('/loyalty/details', authenticateUser, async (req, res) => {
  try {
    const details = await loyaltyService.getLoyaltyProgramDetails(req.user._id);
    res.status(200).json(details);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/loyalty/claim-reward', authenticateUser, async (req, res) => {
  try {
    const { rewardId } = req.body;
    const loyaltyProgram = await loyaltyService.claimReward(req.user._id, rewardId);
    res.status(200).json(loyaltyProgram);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/loyalty/referral', authenticateUser, async (req, res) => {
  try {
    const { referredEmail } = req.body;
    const loyaltyProgram = await loyaltyService.processReferral(req.user._id, referredEmail);
    res.status(200).json(loyaltyProgram);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Remarketing
router.post('/remarketing/abandoned-cart', authenticateUser, async (req, res) => {
  try {
    const { cartItems } = req.body;
    const campaign = await remarketingService.trackAbandonedCart(req.user._id, cartItems);
    res.status(201).json(campaign);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/remarketing/send-email', authenticateUser, async (req, res) => {
  try {
    const campaign = await remarketingService.sendAbandonedCartEmail(req.user._id);
    res.status(200).json(campaign);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
