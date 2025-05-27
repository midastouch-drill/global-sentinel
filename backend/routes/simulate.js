
const express = require('express');
const SimulationController = require('../controllers/simulationController');
const router = express.Router();

// POST /api/simulate - Run crisis simulation
router.post('/', SimulationController.runSimulation);

// GET /api/simulate/:id - Get specific simulation
router.get('/:id', SimulationController.getSimulation);

// GET /api/simulate - Get recent simulations
router.get('/', SimulationController.getRecentSimulations);

module.exports = router;
