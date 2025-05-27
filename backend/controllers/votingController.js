
const { getFirestore, logger, isDemoMode } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

class VotingController {
  static async submitVote(req, res) {
    try {
      console.log('🗳️ Processing threat vote...');
      
      const { threatId, vote, userId = 'anonymous' } = req.body;
      
      if (!threatId || !vote || !['credible', 'not_credible'].includes(vote)) {
        return res.status(400).json({
          success: false,
          error: 'Threat ID and valid vote (credible/not_credible) are required'
        });
      }

      if (isDemoMode()) {
        console.log('🎭 Demo mode: simulating vote submission');
        return res.json({
          success: true,
          message: 'Vote recorded successfully (demo mode)',
          vote: { threatId, vote, userId, timestamp: new Date().toISOString() }
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
      
      // Update vote counts
      currentVotes[vote] = (currentVotes[vote] || 0) + 1;
      
      // Record individual vote
      const voteRecord = {
        id: uuidv4(),
        threatId,
        vote,
        userId,
        timestamp: new Date().toISOString(),
        userAgent: req.get('User-Agent') || 'unknown'
      };
      
      // Update threat with new vote counts
      await threatRef.update({
        votes: currentVotes,
        updatedAt: new Date().toISOString()
      });
      
      // Store individual vote record
      await db.collection('votes').doc(voteRecord.id).set(voteRecord);

      console.log(`✅ Vote recorded: ${vote} for threat ${threatId}`);
      
      res.json({
        success: true,
        message: 'Vote recorded successfully',
        vote: voteRecord,
        newVoteCounts: currentVotes
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
      
      if (isDemoMode()) {
        return res.json({
          success: true,
          votes: { credible: 15, not_credible: 3 },
          totalVotes: 18
        });
      }

      const db = getFirestore();
      const threatDoc = await db.collection('threats').doc(threatId).get();
      
      if (!threatDoc.exists) {
        return res.status(404).json({
          success: false,
          error: 'Threat not found'
        });
      }

      const threatData = threatDoc.data();
      const votes = threatData.votes || { credible: 0, not_credible: 0 };
      const totalVotes = votes.credible + votes.not_credible;

      res.json({
        success: true,
        votes,
        totalVotes,
        credibilityScore: totalVotes > 0 ? Math.round((votes.credible / totalVotes) * 100) : 50
      });

    } catch (error) {
      console.error('❌ Failed to fetch threat votes:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch votes'
      });
    }
  }

  static async getUserProfile(req, res) {
    try {
      const { userId } = req.params;
      
      if (isDemoMode()) {
        return res.json({
          success: true,
          user: {
            id: userId,
            totalVotes: 42,
            accuracy: 87,
            rank: 'Expert Analyst',
            joinDate: '2024-01-15'
          }
        });
      }

      const db = getFirestore();
      const votesSnapshot = await db.collection('votes')
        .where('userId', '==', userId)
        .get();

      const votes = [];
      votesSnapshot.forEach(doc => {
        votes.push({ id: doc.id, ...doc.data() });
      });

      const userProfile = {
        id: userId,
        totalVotes: votes.length,
        accuracy: VotingController.calculateAccuracy(votes),
        rank: VotingController.calculateRank(votes.length),
        joinDate: votes.length > 0 ? votes[0].timestamp : new Date().toISOString()
      };

      res.json({
        success: true,
        user: userProfile
      });

    } catch (error) {
      console.error('❌ Failed to fetch user profile:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user profile'
      });
    }
  }

  static async getLeaderboard(req, res) {
    try {
      const { limit = 10 } = req.query;
      
      if (isDemoMode()) {
        return res.json({
          success: true,
          leaderboard: [
            { userId: 'analyst_001', totalVotes: 156, accuracy: 94, rank: 'Master Analyst' },
            { userId: 'analyst_002', totalVotes: 142, accuracy: 91, rank: 'Expert Analyst' },
            { userId: 'analyst_003', totalVotes: 128, accuracy: 88, rank: 'Expert Analyst' }
          ]
        });
      }

      const db = getFirestore();
      const votesSnapshot = await db.collection('votes')
        .orderBy('timestamp', 'desc')
        .limit(1000)
        .get();

      const userStats = {};
      votesSnapshot.forEach(doc => {
        const vote = doc.data();
        if (!userStats[vote.userId]) {
          userStats[vote.userId] = { votes: [], totalVotes: 0 };
        }
        userStats[vote.userId].votes.push(vote);
        userStats[vote.userId].totalVotes++;
      });

      const leaderboard = Object.entries(userStats)
        .map(([userId, stats]) => ({
          userId,
          totalVotes: stats.totalVotes,
          accuracy: VotingController.calculateAccuracy(stats.votes),
          rank: VotingController.calculateRank(stats.totalVotes)
        }))
        .sort((a, b) => b.totalVotes - a.totalVotes)
        .slice(0, parseInt(limit));

      res.json({
        success: true,
        leaderboard
      });

    } catch (error) {
      console.error('❌ Failed to fetch leaderboard:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch leaderboard'
      });
    }
  }

  static calculateAccuracy(votes) {
    if (votes.length === 0) return 0;
    // Simplified accuracy calculation - in real system, this would compare against verified outcomes
    return Math.floor(Math.random() * 20) + 80; // 80-100% range
  }

  static calculateRank(totalVotes) {
    if (totalVotes >= 100) return 'Master Analyst';
    if (totalVotes >= 50) return 'Expert Analyst';
    if (totalVotes >= 20) return 'Senior Analyst';
    if (totalVotes >= 10) return 'Analyst';
    return 'Junior Analyst';
  }
}

module.exports = VotingController;
