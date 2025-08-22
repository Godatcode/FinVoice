const express = require('express');
const { authenticateUserId } = require('../middleware/auth');
const { getFinancialInsights, getInvestmentAdvice } = require('../controllers/aiController');

const router = express.Router();

// Get financial insights based on user data
router.post('/financial-insights', authenticateUserId, getFinancialInsights);

// Get investment advice based on user profile
router.post('/investment-advice', authenticateUserId, getInvestmentAdvice);

module.exports = router;
