
const express = require('express');
const CrisisSimulationController = require('../controllers/crisisSimulationController');
const ProofChainController = require('../controllers/proofChainController');
const router = express.Router();

// Crisis Simulation Routes
router.post('/simulate', CrisisSimulationController.runSimulation);
router.post('/deep-analysis', CrisisSimulationController.deepAnalysis);

// Verification and Proof Chain Routes
router.post('/verify', ProofChainController.verifyThreat);
router.post('/vote', ProofChainController.voteThreat);

module.exports = router;
