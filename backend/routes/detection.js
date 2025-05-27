
const express = require('express');
const DetectionController = require('../controllers/detectionController');
const router = express.Router();

// POST /api/detect - Run threat detection (protected)
router.post('/', DetectionController.detectThreats);

// GET /api/detect/active - Get currently active threats (protected)
router.get('/active', DetectionController.getActiveThreats);

// POST /api/detect/ingest - Public endpoint for scrapers to send threats
router.post('/ingest', DetectionController.ingestThreat);

module.exports = router;
