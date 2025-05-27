
const express = require('express');
const DetectionController = require('../controllers/detectionController');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');
const router = express.Router();

// POST /api/detect - Run threat detection (protected)
router.post('/', verifyFirebaseToken, DetectionController.detectThreats);

// GET /api/detect/active - Get currently active threats (protected)
router.get('/active', verifyFirebaseToken, DetectionController.getActiveThreats);

// POST /api/detect/ingest - PUBLIC endpoint for scrapers to send threats (NO AUTH REQUIRED)
router.post('/ingest', DetectionController.ingestThreat);

module.exports = router;
