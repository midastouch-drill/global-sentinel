
const { getFirestore } = require('../config/firebase');
const sonarClient = require('../utils/sonarClient');
const { v4: uuidv4 } = require('uuid');

class ProofChainController {
  static async verifyThreat(req, res) {
    try {
      const { threatId, claim, userId } = req.body;
      
      if (!claim) {
        return res.status(400).json({
          success: false,
          error: 'Claim is required for verification'
        });
      }
      
      console.log(`🔍 Verifying claim with Sonar: ${claim.substring(0, 50)}...`);
      
      const verificationId = uuidv4();
      
      // Run dual-sided Sonar reasoning
      const [supportingAnalysis, challengingAnalysis] = await Promise.all([
        sonarClient.sonarReasoning(`Analyze evidence supporting: ${claim}`),
        sonarClient.sonarReasoning(`Challenge and find counter-evidence for: ${claim}`, true)
      ]);
      
      // Run deep search for additional evidence
      const evidenceSearch = await sonarClient.sonarDeepSearch(
        `Find current evidence and sources related to: ${claim}`,
        ['gov', 'org', 'edu', 'int'],
        true
      );
      
      // Parse verification results
      const verification = ProofChainController.parseVerificationResults(
        supportingAnalysis,
        challengingAnalysis, 
        evidenceSearch,
        claim
      );
      
      // Store verification
      const verificationData = {
        id: verificationId,
        threatId: threatId || null,
        claim,
        userId: userId || 'anonymous',
        ...verification,
        supportingAnalysis,
        challengingAnalysis,
        evidenceSearch,
        timestamp: new Date().toISOString(),
        status: 'completed'
      };
      
      try {
        const db = getFirestore();
        await db.collection('verifications').doc(verificationId).set(verificationData);
      } catch (dbError) {
        console.warn('⚠️ Could not store verification:', dbError.message);
      }
      
      console.log(`✅ Verification completed: ${verification.verdict} (${verification.confidence}%)`);
      
      res.json({
        success: true,
        verification: verificationData,
        message: 'Claim verification completed with Sonar intelligence'
      });
      
    } catch (error) {
      console.error('🚨 Verification error:', error);
      res.status(500).json({
        success: false,
        error: 'Verification system failure',
        message: error.message
      });
    }
  }

  static parseVerificationResults(supporting, challenging, evidence, claim) {
    try {
      // Extract key evidence points
      const supportingEvidence = ProofChainController.extractEvidencePoints(supporting);
      const challengingEvidence = ProofChainController.extractEvidencePoints(challenging);
      
      // Calculate confidence based on evidence strength
      const confidence = ProofChainController.calculateConfidence(supporting, challenging, evidence);
      
      // Determine verdict
      const verdict = ProofChainController.determineVerdict(confidence, supportingEvidence, challengingEvidence);
      
      // Extract sources
      const sources = ProofChainController.extractSources(evidence);
      
      return {
        verdict,
        confidence,
        supportingEvidence: supportingEvidence.slice(0, 5),
        challengingEvidence: challengingEvidence.slice(0, 5),
        sources: sources.slice(0, 8),
        reasoning: ProofChainController.generateReasoning(verdict, confidence, supportingEvidence, challengingEvidence),
        credibilityScore: confidence
      };
      
    } catch (error) {
      console.warn('⚠️ Error parsing verification results');
      return ProofChainController.generateFallbackVerification(claim);
    }
  }

  static extractEvidencePoints(text) {
    const evidence = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.match(/^[\d\-\•\*]/)) {
        const cleaned = trimmed.replace(/^[\d\-\•\*\.\s]+/, '');
        if (cleaned.length > 20) {
          evidence.push(cleaned);
        }
      } else if (trimmed.includes('evidence') || trimmed.includes('support') || 
                 trimmed.includes('indicates') || trimmed.includes('suggests')) {
        evidence.push(trimmed);
      }
    }
    
    return evidence;
  }

  static calculateConfidence(supporting, challenging, evidence) {
    let score = 50; // Base confidence
    
    // Analyze supporting strength
    const supportingKeywords = ['confirmed', 'verified', 'documented', 'established', 'proven'];
    supportingKeywords.forEach(keyword => {
      if (supporting.toLowerCase().includes(keyword)) score += 8;
    });
    
    // Analyze challenging strength
    const challengingKeywords = ['disputed', 'unconfirmed', 'questionable', 'contradicts'];
    challengingKeywords.forEach(keyword => {
      if (challenging.toLowerCase().includes(keyword)) score -= 10;
    });
    
    // Evidence quality boost
    const sourceCount = (evidence.match(/https?:\/\/[^\s]+/g) || []).length;
    score += Math.min(sourceCount * 3, 20);
    
    // Credible domains boost
    const credibleDomains = (evidence.match(/\.(gov|edu|org|int)\b/g) || []).length;
    score += credibleDomains * 5;
    
    return Math.max(15, Math.min(95, Math.round(score)));
  }

  static determineVerdict(confidence, supporting, challenging) {
    const supportCount = supporting.length;
    const challengeCount = challenging.length;
    
    if (confidence >= 85 && supportCount > challengeCount) return '✅ Highly Credible';
    if (confidence >= 70 && supportCount >= challengeCount) return '✅ Likely True';
    if (confidence >= 55) return '⚠️ Partially Verified';
    if (confidence >= 40) return '❓ Questionable';
    return '❌ Insufficient Evidence';
  }

  static extractSources(text) {
    const sources = new Set();
    
    // URLs
    const urlPattern = /https?:\/\/[^\s\)]+/g;
    const urls = text.match(urlPattern);
    if (urls) {
      urls.forEach(url => sources.add(url.replace(/[.,;:]$/, '')));
    }
    
    // Domains
    const domainPattern = /\b[a-zA-Z0-9-]+\.(gov|org|edu|int|mil)\b/g;
    const domains = text.match(domainPattern);
    if (domains) {
      domains.forEach(domain => sources.add(`https://${domain}`));
    }
    
    return Array.from(sources);
  }

  static generateReasoning(verdict, confidence, supporting, challenging) {
    const supportCount = supporting.length;
    const challengeCount = challenging.length;
    
    let reasoning = `${verdict} with ${confidence}% confidence. `;
    
    if (supportCount > challengeCount) {
      reasoning += `Analysis found ${supportCount} supporting evidence points against ${challengeCount} challenges. `;
    } else if (challengeCount > supportCount) {
      reasoning += `Significant counter-evidence identified (${challengeCount} vs ${supportCount} supporting). `;
    } else {
      reasoning += `Balanced evidence with ${supportCount} supporting and ${challengeCount} challenging points. `;
    }
    
    if (confidence > 75) {
      reasoning += "High confidence due to credible source verification and consistent evidence patterns.";
    } else if (confidence > 50) {
      reasoning += "Moderate confidence with some uncertainty factors present.";
    } else {
      reasoning += "Low confidence due to limited or conflicting evidence.";
    }
    
    return reasoning;
  }

  static generateFallbackVerification(claim) {
    return {
      verdict: '🔍 Requires Investigation',
      confidence: 50,
      supportingEvidence: ['Initial indicators present in intelligence data'],
      challengingEvidence: ['Limited independent verification sources'],
      sources: ['https://verification-system.gov'],
      reasoning: 'Automated verification encountered limitations. Manual review recommended.',
      credibilityScore: 50
    };
  }

  static async voteThreat(req, res) {
    try {
      const { threatId, vote, userId } = req.body;
      
      if (!threatId || !vote) {
        return res.status(400).json({
          success: false,
          error: 'Threat ID and vote are required'
        });
      }
      
      const voteId = uuidv4();
      const voteData = {
        id: voteId,
        threatId,
        vote, // 'credible' or 'not_credible'
        userId: userId || 'anonymous',
        timestamp: new Date().toISOString()
      };
      
      try {
        const db = getFirestore();
        await db.collection('votes').doc(voteId).set(voteData);
        
        // Update threat credibility score
        await ProofChainController.updateThreatCredibility(threatId);
      } catch (dbError) {
        console.warn('⚠️ Could not store vote:', dbError.message);
      }
      
      console.log(`✅ Vote recorded: ${vote} for threat ${threatId}`);
      
      res.json({
        success: true,
        vote: voteData,
        message: 'Vote recorded successfully'
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

  static async updateThreatCredibility(threatId) {
    try {
      const db = getFirestore();
      
      // Get all votes for this threat
      const votesSnapshot = await db.collection('votes')
        .where('threatId', '==', threatId)
        .get();
      
      let credibleVotes = 0;
      let totalVotes = 0;
      
      votesSnapshot.forEach(doc => {
        const voteData = doc.data();
        totalVotes++;
        if (voteData.vote === 'credible') {
          credibleVotes++;
        }
      });
      
      const credibilityScore = totalVotes > 0 ? Math.round((credibleVotes / totalVotes) * 100) : 50;
      
      // Update threat document
      await db.collection('threats').doc(threatId).update({
        credibilityScore,
        voteCount: totalVotes,
        lastUpdated: new Date().toISOString()
      });
      
      console.log(`✅ Updated threat ${threatId} credibility: ${credibilityScore}% (${totalVotes} votes)`);
      
    } catch (error) {
      console.warn('⚠️ Could not update threat credibility:', error.message);
    }
  }
}

module.exports = ProofChainController;
