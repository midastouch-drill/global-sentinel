
const express = require('express');
const SimulationController = require('../controllers/simulationController');
const router = express.Router();

// POST /api/simulate - Run crisis simulation (legacy endpoint)
router.post('/', SimulationController.runSimulation);

module.exports = router;
