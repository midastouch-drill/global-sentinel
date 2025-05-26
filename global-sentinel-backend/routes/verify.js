
const express = require('express');
const VerificationController = require('../controllers/verificationController');
const router = express.Router();

// POST /api/verify - Verify a claim
router.post('/', VerificationController.verifyClaim);

// GET /api/verify/:id - Get specific verification
router.get('/:id', VerificationController.getVerification);

// GET /api/verify/threat/:threatId - Get verifications for a threat
router.get('/threat/:threatId', VerificationController.getVerificationsByThreat);

module.exports = router;
