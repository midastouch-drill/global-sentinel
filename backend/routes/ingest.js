
const express = require('express');
const DetectionController = require('../controllers/detectionController');
const router = express.Router();

// POST /api/ingest - Direct threat ingestion endpoint
router.post('/', DetectionController.ingestThreat);

module.exports = router;
