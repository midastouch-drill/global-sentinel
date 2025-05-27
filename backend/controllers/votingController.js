
const { getFirestore } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

class VotingController {
  static async submitVote(req, res) {
    try {
      const { threatId, vote, userId, userType = 'citizen' } = req.body;
      
      if (!threatId || !vote || !['confirm', 'deny', 'skeptical'].includes(vote)) {
        return res.status(400).json({
          success: false,
          error: 'Valid threatId and vote (confirm/deny/skeptical) are required'
        });
      }
      
      console.log(`🗳️ Processing vote: ${vote} for threat ${threatId}`);
      
      const db = getFirestore();
      
      // Check if user already voted on this threat
      if (userId) {
        const existingVoteQuery = await db.collection('votes')
          .where('threatId', '==', threatId)
          .where('userId', '==', userId)
          .get();
        
        if (!existingVoteQuery.empty) {
          return res.status(400).json({
            success: false,
            error: 'User has already voted on this threat'
          });
        }
      }
      
      // Create vote record
      const voteData = {
        id: uuidv4(),
        threatId,
        vote,
        userId: userId || `anonymous_${Date.now()}`,
        userType,
        timestamp: new Date().toISOString(),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      };
      
      // Store vote
      await db.collection('votes').doc(voteData.id).set(voteData);
      
      // Update threat vote counts
      await VotingController.updateThreatVoteCounts(threatId, vote);
      
      // Award XP points if registered user
      if (userId && userType === 'citizen') {
        await VotingController.awardXP(userId, 10); // 10 XP per vote
      }
      
      console.log(`✅ Vote recorded: ${voteData.id}`);
      
      res.json({
        success: true,
        voteId: voteData.id,
        message: 'Vote submitted successfully',
        xpAwarded: userId && userType === 'citizen' ? 10 : 0
      });
      
    } catch (error) {
      console.error('🚨 Voting error:', error);
      res.status(500).json({
        success: false,
        error: 'Voting system failure',
        message: error.message
      });
    }
  }

  static async updateThreatVoteCounts(threatId, vote) {
    try {
      const db = getFirestore();
      const threatRef = db.collection('threats').doc(threatId);
      
      // Get current threat data
      const threatDoc = await threatRef.get();
      if (!threatDoc.exists) {
        throw new Error('Threat not found');
      }
      
      const threatData = threatDoc.data();
      const currentVotes = threatData.votes || { confirm: 0, deny: 0, skeptical: 0 };
      
      // Increment the appropriate vote count
      currentVotes[vote] = (currentVotes[vote] || 0) + 1;
      
      // Calculate credibility score
      const totalVotes = currentVotes.confirm + currentVotes.deny + currentVotes.skeptical;
      const credibilityScore = totalVotes > 0 
        ? Math.round(((currentVotes.confirm * 1 + currentVotes.skeptical * 0.5) / totalVotes) * 100)
        : 50;
      
      // Update threat document
      await threatRef.update({
        votes: currentVotes,
        credibilityScore,
        lastVoteTimestamp: new Date().toISOString()
      });
      
      console.log(`📊 Updated vote counts for threat ${threatId}: ${JSON.stringify(currentVotes)}`);
      
    } catch (error) {
      console.error('🚨 Vote count update error:', error);
      throw error;
    }
  }

  static async awardXP(userId, points) {
    try {
      const db = getFirestore();
      const userRef = db.collection('users').doc(userId);
      
      // Get or create user profile
      const userDoc = await userRef.get();
      let userData = userDoc.exists ? userDoc.data() : {
        id: userId,
        xp: 0,
        level: 1,
        badges: [],
        joinedAt: new Date().toISOString()
      };
      
      // Award XP
      userData.xp += points;
      
      // Calculate level (100 XP per level)
      const newLevel = Math.floor(userData.xp / 100) + 1;
      if (newLevel > userData.level) {
        userData.level = newLevel;
        userData.badges = userData.badges || [];
        
        // Award badges based on level
        if (newLevel === 5 && !userData.badges.includes('Verified Analyst')) {
          userData.badges.push('Verified Analyst');
        }
        if (newLevel === 10 && !userData.badges.includes('Threat Hunter')) {
          userData.badges.push('Threat Hunter');
        }
        if (newLevel === 20 && !userData.badges.includes('Guardian Sentinel')) {
          userData.badges.push('Guardian Sentinel');
        }
      }
      
      userData.lastActivityAt = new Date().toISOString();
      
      // Update user profile
      await userRef.set(userData, { merge: true });
      
      console.log(`🏆 Awarded ${points} XP to user ${userId} (Level ${userData.level})`);
      
    } catch (error) {
      console.error('🚨 XP award error:', error);
      // Don't throw - XP failure shouldn't break voting
    }
  }

  static async getThreatVotes(req, res) {
    try {
      const { threatId } = req.params;
      const db = getFirestore();
      
      // Get vote breakdown
      const votesSnapshot = await db.collection('votes')
        .where('threatId', '==', threatId)
        .get();
      
      const votes = {
        confirm: 0,
        deny: 0,
        skeptical: 0,
        total: 0,
        breakdown: []
      };
      
      votesSnapshot.forEach(doc => {
        const voteData = doc.data();
        votes[voteData.vote]++;
        votes.total++;
        votes.breakdown.push({
          id: doc.id,
          vote: voteData.vote,
          userType: voteData.userType,
          timestamp: voteData.timestamp
        });
      });
      
      // Calculate percentages
      votes.percentages = {
        confirm: votes.total > 0 ? Math.round((votes.confirm / votes.total) * 100) : 0,
        deny: votes.total > 0 ? Math.round((votes.deny / votes.total) * 100) : 0,
        skeptical: votes.total > 0 ? Math.round((votes.skeptical / votes.total) * 100) : 0
      };
      
      res.json({
        success: true,
        threatId,
        votes
      });
      
    } catch (error) {
      console.error('🚨 Vote fetch error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch threat votes'
      });
    }
  }

  static async getUserProfile(req, res) {
    try {
      const { userId } = req.params;
      const db = getFirestore();
      
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        return res.status(404).json({
          success: false,
          error: 'User profile not found'
        });
      }
      
      const userData = userDoc.data();
      
      // Get user's recent votes
      const recentVotesSnapshot = await db.collection('votes')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get();
      
      const recentVotes = [];
      recentVotesSnapshot.forEach(doc => {
        recentVotes.push({ id: doc.id, ...doc.data() });
      });
      
      res.json({
        success: true,
        user: {
          ...userData,
          recentVotes
        }
      });
      
    } catch (error) {
      console.error('🚨 User profile fetch error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user profile'
      });
    }
  }

  static async getLeaderboard(req, res) {
    try {
      const db = getFirestore();
      const { limit = 10 } = req.query;
      
      const usersSnapshot = await db.collection('users')
        .orderBy('xp', 'desc')
        .limit(parseInt(limit))
        .get();
      
      const leaderboard = [];
      usersSnapshot.forEach((doc, index) => {
        const userData = doc.data();
        leaderboard.push({
          rank: index + 1,
          userId: doc.id,
          xp: userData.xp,
          level: userData.level,
          badges: userData.badges || []
        });
      });
      
      res.json({
        success: true,
        leaderboard
      });
      
    } catch (error) {
      console.error('🚨 Leaderboard fetch error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch leaderboard'
      });
    }
  }
}

module.exports = VotingController;
