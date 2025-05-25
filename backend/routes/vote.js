
const express = require('express');
const VotingController = require('../controllers/votingController');
const router = express.Router();

// POST /api/vote - Submit a vote
router.post('/', VotingController.submitVote);

// GET /api/vote/threat/:threatId - Get votes for a threat
router.get('/threat/:threatId', VotingController.getThreatVotes);

// GET /api/vote/user/:userId - Get user profile
router.get('/user/:userId', VotingController.getUserProfile);

// GET /api/vote/leaderboard - Get top users
router.get('/leaderboard', VotingController.getLeaderboard);

module.exports = router;
