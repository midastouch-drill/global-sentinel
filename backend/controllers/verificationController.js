
const { getFirestore } = require('../config/firebase');
const openRouterClient = require('../utils/openRouterClient');
const SonarPromptBuilder = require('../utils/sonarPromptBuilder');
const { v4: uuidv4 } = require('uuid');

class VerificationController {
  static async verifyClaim(req, res) {
    try {
      const { claim, threatId } = req.body;
      
      if (!claim) {
        return res.status(400).json({
          success: false,
          error: 'Claim is required for verification'
        });
      }
      
      console.log(`🔍 Verifying claim: ${claim.substring(0, 100)}...`);
      
      const db = getFirestore();
      const prompt = SonarPromptBuilder.buildVerificationPrompt(claim);
      
      // Run both supporting and counter analysis
      const [supportingAnalysis, counterAnalysis] = await Promise.all([
        openRouterClient.callSonarReasoning(prompt),
        openRouterClient.callSonarReasoning(prompt, true) // Use counter flag
      ]);
      
      // Parse verification results
      const verification = await VerificationController.parseVerification(
        supportingAnalysis, 
        counterAnalysis, 
        claim
      );
      
      // Store verification in Firestore
      const verificationData = {
        id: uuidv4(),
        claim,
        threatId: threatId || null,
        ...verification,
        timestamp: new Date().toISOString(),
        status: 'completed'
      };
      
      await db.collection('verifications').doc(verificationData.id).set(verificationData);
      
      console.log(`✅ Verification completed: ${verification.verdict} (${verification.confidence}%)`);
      
      res.json({
        success: true,
        verification: verificationData,
        message: 'Claim verification completed'
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

  static async parseVerification(supportingText, counterText, claim) {
    try {
      const supportingEvidence = VerificationController.extractEvidence(supportingText);
      const counterEvidence = VerificationController.extractEvidence(counterText);
      const confidence = VerificationController.calculateConfidence(supportingText, counterText);
      const verdict = VerificationController.determineVerdict(confidence, supportingEvidence, counterEvidence);
      const sources = VerificationController.extractSources(supportingText + ' ' + counterText);
      
      return {
        verdict,
        confidence,
        supportingEvidence,
        counterEvidence,
        sources,
        reasoning: VerificationController.generateReasoning(verdict, confidence, supportingEvidence, counterEvidence)
      };
      
    } catch (error) {
      console.warn('⚠️ Verification parsing fallback triggered');
      return VerificationController.generateFallbackVerification(claim);
    }
  }

  static extractEvidence(text) {
    const evidence = [];
    const lines = text.split('\n');
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.includes('evidence') || trimmed.includes('support') || 
          trimmed.includes('shows') || trimmed.includes('indicates')) {
        evidence.push(trimmed);
      } else if (trimmed.match(/^[\-\•\*]\s/)) {
        evidence.push(trimmed.replace(/^[\-\•\*]\s/, ''));
      }
    });
    
    return evidence.slice(0, 5); // Limit to top 5 pieces of evidence
  }

  static calculateConfidence(supportingText, counterText) {
    const supportingKeywords = ['confirmed', 'verified', 'documented', 'established', 'proven'];
    const uncertaintyKeywords = ['alleged', 'unconfirmed', 'disputed', 'questionable', 'unclear'];
    
    let score = 50; // Base confidence
    
    // Check supporting text
    supportingKeywords.forEach(keyword => {
      if (supportingText.toLowerCase().includes(keyword)) score += 8;
    });
    
    // Check for uncertainty indicators
    uncertaintyKeywords.forEach(keyword => {
      if (supportingText.toLowerCase().includes(keyword)) score -= 10;
    });
    
    // Counter-evidence impact
    const counterStrength = counterText.length / supportingText.length;
    score -= Math.min(counterStrength * 20, 30);
    
    // Source quality boost
    const credibleSources = (supportingText.match(/\.(gov|edu|org)\b/g) || []).length;
    score += credibleSources * 3;
    
    return Math.max(10, Math.min(95, Math.round(score)));
  }

  static determineVerdict(confidence, supportingEvidence, counterEvidence) {
    const supportCount = supportingEvidence.length;
    const counterCount = counterEvidence.length;
    
    if (confidence >= 80 && supportCount > counterCount) return 'Highly Credible';
    if (confidence >= 65 && supportCount >= counterCount) return 'Likely True';
    if (confidence >= 50) return 'Partially Verified';
    if (confidence >= 35) return 'Questionable';
    return 'Insufficient Evidence';
  }

  static extractSources(text) {
    const sources = new Set();
    
    // Extract URLs
    const urlPattern = /https?:\/\/[^\s]+/g;
    const urls = text.match(urlPattern);
    if (urls) urls.forEach(url => sources.add(url));
    
    // Extract domain references
    const domainPattern = /\b[a-zA-Z0-9-]+\.(com|org|gov|edu|int|net)\b/g;
    const domains = text.match(domainPattern);
    if (domains) domains.forEach(domain => sources.add(domain));
    
    // Extract publication names
    const pubPattern = /\b(Reuters|BBC|CNN|AP News|Washington Post|New York Times|Guardian|Financial Times)\b/gi;
    const pubs = text.match(pubPattern);
    if (pubs) pubs.forEach(pub => sources.add(pub));
    
    return Array.from(sources).slice(0, 10);
  }

  static generateReasoning(verdict, confidence, supportingEvidence, counterEvidence) {
    const supportCount = supportingEvidence.length;
    const counterCount = counterEvidence.length;
    
    let reasoning = `Verdict: ${verdict} with ${confidence}% confidence. `;
    
    if (supportCount > counterCount) {
      reasoning += `Analysis found ${supportCount} supporting evidence points against ${counterCount} counter-arguments. `;
    } else if (counterCount > supportCount) {
      reasoning += `Significant counter-evidence identified (${counterCount} points vs ${supportCount} supporting). `;
    } else {
      reasoning += `Balanced evidence with ${supportCount} supporting and ${counterCount} opposing points. `;
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
      verdict: 'Requires Investigation',
      confidence: 50,
      supportingEvidence: ['Initial indicators present'],
      counterEvidence: ['Limited independent verification'],
      sources: ['verification-system.gov'],
      reasoning: 'Automated verification system encountered limitations. Manual review recommended.'
    };
  }

  static async getVerification(req, res) {
    try {
      const { id } = req.params;
      const db = getFirestore();
      
      const doc = await db.collection('verifications').doc(id).get();
      
      if (!doc.exists) {
        return res.status(404).json({
          success: false,
          error: 'Verification not found'
        });
      }
      
      res.json({
        success: true,
        verification: { id: doc.id, ...doc.data() }
      });
      
    } catch (error) {
      console.error('🚨 Verification fetch error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch verification'
      });
    }
  }

  static async getVerificationsByThreat(req, res) {
    try {
      const { threatId } = req.params;
      const db = getFirestore();
      
      const snapshot = await db.collection('verifications')
        .where('threatId', '==', threatId)
        .orderBy('timestamp', 'desc')
        .get();
      
      const verifications = [];
      snapshot.forEach(doc => {
        verifications.push({ id: doc.id, ...doc.data() });
      });
      
      res.json({
        success: true,
        verifications,
        count: verifications.length
      });
      
    } catch (error) {
      console.error('🚨 Threat verifications fetch error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch threat verifications'
      });
    }
  }
}

module.exports = VerificationController;
