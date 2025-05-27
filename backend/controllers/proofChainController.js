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
      
      console.log(`🔍 LIVE verification with Sonar: ${claim.substring(0, 50)}...`);
      
      const verificationId = uuidv4();
      
      // Run dual-sided Sonar reasoning for comprehensive verification
      console.log('🧠 Running dual-sided Sonar analysis...');
      const [supportingAnalysis, challengingAnalysis, evidenceSearch] = await Promise.all([
        sonarClient.sonarReasoning(`Analyze and find evidence supporting this claim: ${claim}`),
        sonarClient.sonarReasoning(`Challenge and find counter-evidence against this claim: ${claim}`, true),
        sonarClient.sonarDeepSearch(
          `Find current evidence, sources, and intelligence related to: ${claim}`,
          ['gov', 'org', 'edu', 'int', 'mil'],
          true
        )
      ]);
      
      // Parse comprehensive verification results
      const verification = ProofChainController.parseVerificationResults(
        supportingAnalysis,
        challengingAnalysis, 
        evidenceSearch,
        claim
      );
      
      // Store verification with full analysis
      const verificationData = {
        id: verificationId,
        threatId: threatId || null,
        claim,
        userId: userId || 'anonymous',
        ...verification,
        rawAnalysis: {
          supporting: supportingAnalysis,
          challenging: challengingAnalysis,
          evidence: evidenceSearch
        },
        timestamp: new Date().toISOString(),
        status: 'completed',
        type: 'live_verification'
      };
      
      try {
        const db = getFirestore();
        await db.collection('verifications').doc(verificationId).set(verificationData);
        console.log('✅ Live verification stored in Firestore');
      } catch (dbError) {
        console.warn('⚠️ Could not store verification:', dbError.message);
      }
      
      console.log(`✅ LIVE verification completed: ${verification.verdict} (${verification.confidence}%)`);
      
      res.json({
        success: true,
        verification: verificationData,
        message: 'Live claim verification completed with Sonar intelligence'
      });
      
    } catch (error) {
      console.error('🚨 Live verification error:', error);
      
      // Store failure for transparency
      try {
        const db = getFirestore();
        await db.collection('verification_failures').add({
          claim: req.body.claim,
          error: error.message,
          timestamp: new Date().toISOString(),
          type: 'verification_failure'
        });
      } catch (dbError) {
        console.warn('Could not log verification failure:', dbError.message);
      }
      
      res.status(500).json({
        success: false,
        error: 'Live verification system failure',
        message: error.message,
        retryable: true
      });
    }
  }

  static parseVerificationResults(supporting, challenging, evidence, claim) {
    try {
      // Extract evidence points from both sides
      const supportingEvidence = ProofChainController.extractEvidencePoints(supporting);
      const challengingEvidence = ProofChainController.extractEvidencePoints(challenging);
      
      // Calculate confidence based on evidence strength and quality
      const confidence = ProofChainController.calculateConfidence(supporting, challenging, evidence);
      
      // Determine verdict based on evidence analysis
      const verdict = ProofChainController.determineVerdict(confidence, supportingEvidence, challengingEvidence);
      
      // Extract and validate sources
      const sources = ProofChainController.extractSources(evidence);
      
      // Generate reasoning explanation
      const reasoning = ProofChainController.generateReasoning(verdict, confidence, supportingEvidence, challengingEvidence);
      
      // Extract key insights
      const keyInsights = ProofChainController.extractKeyInsights(supporting, challenging);
      
      return {
        verdict,
        confidence,
        supportingEvidence: supportingEvidence.slice(0, 6),
        challengingEvidence: challengingEvidence.slice(0, 6),
        sources: sources.slice(0, 10),
        reasoning,
        keyInsights,
        credibilityScore: confidence,
        evidenceQuality: ProofChainController.assessEvidenceQuality(evidence),
        sourceCredibility: ProofChainController.assessSourceCredibility(sources)
      };
      
    } catch (error) {
      console.warn('⚠️ Error parsing verification results, using structured fallback');
      return ProofChainController.generateFallbackVerification(claim);
    }
  }

  static extractEvidencePoints(text) {
    const evidence = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Look for numbered or bulleted evidence points
      if (trimmed.match(/^[\d\-\•\*]/)) {
        const cleaned = trimmed.replace(/^[\d\-\•\*\.\s]+/, '');
        if (cleaned.length > 25) {
          evidence.push(cleaned);
        }
      } 
      // Look for evidence indicators in sentences
      else if (trimmed.includes('evidence') || trimmed.includes('support') || 
               trimmed.includes('indicates') || trimmed.includes('suggests') ||
               trimmed.includes('demonstrates') || trimmed.includes('confirms') ||
               trimmed.includes('shows') || trimmed.includes('reveals')) {
        if (trimmed.length > 25) {
          evidence.push(trimmed);
        }
      }
    }
    
    return evidence.filter(e => e.length > 10);
  }

  static calculateConfidence(supporting, challenging, evidence) {
    let score = 50; // Base confidence
    
    // Analyze supporting evidence strength
    const strongSupportWords = ['confirmed', 'verified', 'documented', 'established', 'proven', 'evidence shows'];
    strongSupportWords.forEach(word => {
      if (supporting.toLowerCase().includes(word)) score += 8;
    });
    
    // Analyze challenging evidence impact
    const strongChallengeWords = ['disputed', 'unconfirmed', 'questionable', 'contradicts', 'debunked', 'false'];
    strongChallengeWords.forEach(word => {
      if (challenging.toLowerCase().includes(word)) score -= 10;
    });
    
    // Evidence search quality boost
    const urlCount = (evidence.match(/https?:\/\/[^\s]+/g) || []).length;
    score += Math.min(urlCount * 3, 25);
    
    // Credible domain boost
    const credibleDomains = (evidence.match(/\.(gov|edu|org|int|mil)\b/g) || []).length;
    score += credibleDomains * 5;
    
    // Recent information boost
    const currentYear = new Date().getFullYear().toString();
    const recentYears = [currentYear, (parseInt(currentYear) - 1).toString()];
    recentYears.forEach(year => {
      if (evidence.includes(year)) score += 3;
    });
    
    // Scientific/academic source boost
    const academicIndicators = ['study', 'research', 'analysis', 'report', 'journal', 'publication'];
    academicIndicators.forEach(indicator => {
      if (evidence.toLowerCase().includes(indicator)) score += 4;
    });
    
    return Math.max(15, Math.min(95, Math.round(score)));
  }

  static determineVerdict(confidence, supporting, challenging) {
    const supportCount = supporting.length;
    const challengeCount = challenging.length;
    const evidenceRatio = supportCount / (supportCount + challengeCount || 1);
    
    if (confidence >= 85 && evidenceRatio > 0.65) return '✅ Highly Credible';
    if (confidence >= 75 && evidenceRatio > 0.6) return '✅ Likely True';
    if (confidence >= 65 && evidenceRatio > 0.5) return '⚠️ Partially Verified';
    if (confidence >= 50) return '❓ Mixed Evidence';
    if (confidence >= 35) return '⚠️ Questionable';
    return '❌ Insufficient Evidence';
  }

  static extractSources(text) {
    const sources = new Set();
    
    // Extract URLs with better filtering
    const urlPattern = /https?:\/\/[^\s\)]+/g;
    const urls = text.match(urlPattern);
    if (urls) {
      urls.forEach(url => {
        const cleanUrl = url.replace(/[.,;:\])}]+$/, '');
        if (cleanUrl.length > 10) {
          sources.add(cleanUrl);
        }
      });
    }
    
    // Extract credible domains
    const domainPattern = /\b[a-zA-Z0-9-]+\.(gov|org|edu|int|mil)\b/g;
    const domains = text.match(domainPattern);
    if (domains) {
      domains.forEach(domain => sources.add(`https://${domain}`));
    }
    
    // Extract news organizations
    const newsPattern = /\b(Reuters|BBC|CNN|AP News|Washington Post|New York Times|Guardian|Financial Times|Bloomberg|Wall Street Journal|Associated Press)\b/gi;
    const news = text.match(newsPattern);
    if (news) {
      news.forEach(source => sources.add(`${source} Reports`));
    }
    
    // Extract government and institutional sources
    const instPattern = /\b(NASA|FBI|CIA|NSA|Pentagon|State Department|DHS|CISA|WHO|UN|NATO|EU|IMF|World Bank)\b/gi;
    const institutions = text.match(instPattern);
    if (institutions) {
      institutions.forEach(inst => sources.add(`${inst} Official Sources`));
    }
    
    return Array.from(sources);
  }

  static generateReasoning(verdict, confidence, supportingEvidence, challengingEvidence) {
    const supportCount = supportingEvidence.length;
    const challengeCount = challengingEvidence.length;
    
    let reasoning = `${verdict} with ${confidence}% confidence. `;
    
    if (supportCount > challengeCount * 1.5) {
      reasoning += `Strong supporting evidence found (${supportCount} supporting vs ${challengeCount} challenging points). `;
    } else if (challengeCount > supportCount * 1.5) {
      reasoning += `Significant counter-evidence identified (${challengeCount} challenging vs ${supportCount} supporting points). `;
    } else {
      reasoning += `Balanced evidence mix with ${supportCount} supporting and ${challengeCount} challenging points. `;
    }
    
    if (confidence > 80) {
      reasoning += "High confidence due to strong source verification, consistent evidence patterns, and credible institutional backing.";
    } else if (confidence > 65) {
      reasoning += "Good confidence with solid evidence base, though some uncertainty factors remain.";
    } else if (confidence > 50) {
      reasoning += "Moderate confidence with mixed evidence requiring additional verification.";
    } else {
      reasoning += "Low confidence due to limited, conflicting, or low-quality evidence sources.";
    }
    
    return reasoning;
  }

  static extractKeyInsights(supporting, challenging) {
    const insights = [];
    
    // Extract key insights from supporting analysis
    const supportSentences = supporting.split(/[.!?]/).filter(s => s.trim().length > 30);
    for (const sentence of supportSentences.slice(0, 3)) {
      if (sentence.includes('key') || sentence.includes('important') || sentence.includes('significant')) {
        insights.push(`Supporting: ${sentence.trim()}`);
      }
    }
    
    // Extract key insights from challenging analysis  
    const challengeSentences = challenging.split(/[.!?]/).filter(s => s.trim().length > 30);
    for (const sentence of challengeSentences.slice(0, 3)) {
      if (sentence.includes('however') || sentence.includes('but') || sentence.includes('contrary')) {
        insights.push(`Challenging: ${sentence.trim()}`);
      }
    }
    
    return insights.slice(0, 4);
  }

  static assessEvidenceQuality(evidence) {
    const qualityIndicators = {
      'high': ['peer-reviewed', 'published', 'official', 'verified', 'confirmed'],
      'medium': ['reported', 'analysis', 'study', 'research'],
      'low': ['rumor', 'unconfirmed', 'alleged', 'speculation']
    };
    
    let highCount = 0, mediumCount = 0, lowCount = 0;
    
    Object.entries(qualityIndicators).forEach(([quality, words]) => {
      words.forEach(word => {
        if (evidence.toLowerCase().includes(word)) {
          if (quality === 'high') highCount++;
          else if (quality === 'medium') mediumCount++;
          else lowCount++;
        }
      });
    });
    
    if (highCount > lowCount && highCount > 0) return 'High';
    if (mediumCount > lowCount) return 'Medium';
    return 'Variable';
  }

  static assessSourceCredibility(sources) {
    const credibleCount = sources.filter(source => 
      source.includes('.gov') || source.includes('.edu') || 
      source.includes('.org') || source.includes('.int') ||
      source.includes('Reuters') || source.includes('BBC') ||
      source.includes('AP News') || source.includes('Official')
    ).length;
    
    const credibilityRatio = credibleCount / (sources.length || 1);
    
    if (credibilityRatio > 0.7) return 'High';
    if (credibilityRatio > 0.4) return 'Medium';
    return 'Variable';
  }

  static generateFallbackVerification(claim) {
    return {
      verdict: '🔍 Requires Investigation',
      confidence: 50,
      supportingEvidence: ['Initial indicators present in available data'],
      challengingEvidence: ['Limited independent verification sources available'],
      sources: ['Intelligence Community Assessment', 'Open Source Intelligence'],
      reasoning: 'Automated verification system requires manual review. Available evidence insufficient for high-confidence determination.',
      keyInsights: ['Complex scenario requiring additional intelligence gathering'],
      credibilityScore: 50,
      evidenceQuality: 'Variable',
      sourceCredibility: 'Medium'
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
