
const express = require('express');
const DetectionController = require('../controllers/detectionController');
const router = express.Router();

// POST /api/detect - Run threat detection
router.post('/', DetectionController.detectThreats);

// GET /api/detect/active - Get currently active threats
router.get('/active', DetectionController.getActiveThreats);

module.exports = router;
