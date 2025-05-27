
const { getFirestore } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

class VotingController {
  static async submitVote(req, res) {
    try {
      console.log('🗳️ Processing vote submission...');
      
      const { threatId, vote, userId = 'anonymous' } = req.body;
      
      if (!threatId || !vote) {
        return res.status(400).json({
          success: false,
          error: 'Threat ID and vote are required'
        });
      }

      if (!['credible', 'not_credible'].includes(vote)) {
        return res.status(400).json({
          success: false,
          error: 'Vote must be either "credible" or "not_credible"'
        });
      }

      const db = getFirestore();
      const threatRef = db.collection('threats').doc(threatId);
      
      // Get current threat data
      const threatDoc = await threatRef.get();
      if (!threatDoc.exists) {
        return res.status(404).json({
          success: false,
          error: 'Threat not found'
        });
      }

      const threatData = threatDoc.data();
      const currentVotes = threatData.votes || { credible: 0, not_credible: 0 };
      
      // Increment the appropriate vote count
      currentVotes[vote] = (currentVotes[vote] || 0) + 1;
      
      // Update the threat with new vote count
      await threatRef.update({
        votes: currentVotes,
        updatedAt: new Date().toISOString()
      });

      console.log(`✅ Vote recorded: ${vote} for threat ${threatId}`);
      
      res.json({
        success: true,
        message: 'Vote recorded successfully',
        votes: currentVotes
      });

    } catch (error) {
      console.error('❌ Vote submission failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to record vote'
      });
    }
  }

  static async getThreatVotes(req, res) {
    try {
      const { threatId } = req.params;
      const db = getFirestore();
      
      const threatDoc = await db.collection('threats').doc(threatId).get();
      
      if (!threatDoc.exists) {
        return res.status(404).json({
          success: false,
          error: 'Threat not found'
        });
      }

      const votes = threatDoc.data().votes || { credible: 0, not_credible: 0 };
      
      res.json({
        success: true,
        votes
      });

    } catch (error) {
      console.error('❌ Failed to get votes:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve votes'
      });
    }
  }

  static async getUserProfile(req, res) {
    try {
      // Mock user profile for now
      res.json({
        success: true,
        user: {
          id: req.params.userId,
          votesSubmitted: 0,
          threatsVerified: 0,
          reputation: 100
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get user profile'
      });
    }
  }

  static async getLeaderboard(req, res) {
    try {
      // Mock leaderboard for now
      res.json({
        success: true,
        leaderboard: [
          { userId: 'user1', reputation: 950, votesSubmitted: 45 },
          { userId: 'user2', reputation: 820, votesSubmitted: 38 }
        ]
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get leaderboard'
      });
    }
  }
}

module.exports = VotingController;
