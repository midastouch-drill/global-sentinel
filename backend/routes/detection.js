
const express = require('express');
const DetectionController = require('../controllers/detectionController');
const { optionalAuth } = require('../middleware/authMiddleware');
const router = express.Router();

// POST /api/detect - Run threat detection (optional auth for now)
router.post('/', optionalAuth, DetectionController.detectThreats);

// GET /api/detect/threats - Get currently active threats (public access for frontend)
router.get('/threats', DetectionController.getActiveThreats);

// POST /api/detect/ingest - PUBLIC endpoint for scrapers to send threats (NO AUTH REQUIRED)
router.post('/ingest', DetectionController.ingestThreat);

module.exports = router;
