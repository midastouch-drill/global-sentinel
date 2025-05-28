
const express = require('express');
const TrendsController = require('../controllers/trendsController');
const router = express.Router();

// GET /api/trends - Get trend analysis
router.get('/', TrendsController.getTrends);

// GET /api/trends/forecast - Get threat forecast
router.get('/forecast', TrendsController.getForecast);

module.exports = router;
