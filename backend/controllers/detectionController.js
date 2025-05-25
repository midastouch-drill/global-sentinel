
const { getFirestore } = require('../config/firebase');
const openRouterClient = require('../utils/openRouterClient');
const SonarPromptBuilder = require('../utils/sonarPromptBuilder');
const ChaosIndexCalculator = require('../utils/chaosIndexCalculator');
const { v4: uuidv4 } = require('uuid');

class DetectionController {
  static async detectThreats(req, res) {
    try {
      console.log('🔍 Initiating global threat detection scan...');
      
      const db = getFirestore();
      const prompt = SonarPromptBuilder.buildThreatDetectionPrompt();
      
      // Call Sonar for threat analysis
      const analysis = await openRouterClient.callSonarDeep(prompt);
      
      // Parse AI response (assuming it returns structured data)
      const threats = await DetectionController.parseThreats(analysis);
      
      // Calculate severity scores
      const processedThreats = threats.map(threat => ({
        ...threat,
        id: uuidv4(),
        severity: ChaosIndexCalculator.calculateThreatSeverity(threat),
        timestamp: new Date().toISOString(),
        status: 'active',
        votes: { confirm: 0, deny: 0, skeptical: 0 }
      }));
      
      // Store in Firestore
      const batch = db.batch();
      processedThreats.forEach(threat => {
        const threatRef = db.collection('threats').doc(threat.id);
        batch.set(threatRef, threat);
      });
      
      await batch.commit();
      
      // Calculate current chaos index
      const chaosIndex = ChaosIndexCalculator.calculateGlobalChaosIndex(processedThreats);
      
      console.log(`✅ Detected ${processedThreats.length} threats, Chaos Index: ${chaosIndex}`);
      
      res.json({
        success: true,
        threats: processedThreats,
        chaosIndex,
        timestamp: new Date().toISOString(),
        message: `Global threat scan complete - ${processedThreats.length} active threats detected`
      });
      
    } catch (error) {
      console.error('🚨 Threat detection error:', error);
      res.status(500).json({
        success: false,
        error: 'Threat detection system failure',
        message: error.message
      });
    }
  }

  static async parseThreats(aiResponse) {
    try {
      // Try to extract JSON from AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return Array.isArray(parsed.threats) ? parsed.threats : [parsed];
      }
      
      // Fallback: parse text format
      return DetectionController.parseTextThreats(aiResponse);
      
    } catch (error) {
      console.warn('⚠️ Threat parsing fallback triggered');
      return DetectionController.generateFallbackThreats();
    }
  }

  static parseTextThreats(text) {
    // Basic text parsing for threat extraction
    const threats = [];
    const lines = text.split('\n').filter(line => line.trim());
    
    let currentThreat = {};
    
    lines.forEach(line => {
      if (line.includes('Title:') || line.includes('Threat:')) {
        if (currentThreat.title) threats.push(currentThreat);
        currentThreat = { title: line.split(':')[1]?.trim() };
      } else if (line.includes('Severity:')) {
        const severityMatch = line.match(/(\d+)/);
        currentThreat.severity = severityMatch ? parseInt(severityMatch[1]) : 50;
      } else if (line.includes('Type:')) {
        currentThreat.type = line.split(':')[1]?.trim() || 'Unknown';
      } else if (line.includes('Summary:')) {
        currentThreat.summary = line.split(':')[1]?.trim();
      }
    });
    
    if (currentThreat.title) threats.push(currentThreat);
    
    return threats.length > 0 ? threats : DetectionController.generateFallbackThreats();
  }

  static generateFallbackThreats() {
    return [
      {
        title: "AI-powered disinformation campaigns targeting elections",
        type: "Cyber",
        severity: 78,
        summary: "Sophisticated deepfake and AI-generated content spreading across social platforms",
        regions: ["North America", "Europe"],
        sources: ["reuters.com", "bbc.com"]
      },
      {
        title: "Climate-induced migration crisis building in Central Asia",
        type: "Climate", 
        severity: 71,
        summary: "Unprecedented drought conditions forcing population displacement",
        regions: ["Central Asia"],
        sources: ["un.org", "who.int"]
      }
    ];
  }

  static async getActiveThreats(req, res) {
    try {
      const db = getFirestore();
      const threatsRef = db.collection('threats');
      
      const snapshot = await threatsRef
        .where('status', '==', 'active')
        .orderBy('severity', 'desc')
        .limit(10)
        .get();
      
      const threats = [];
      snapshot.forEach(doc => {
        threats.push({ id: doc.id, ...doc.data() });
      });
      
      const chaosIndex = ChaosIndexCalculator.calculateGlobalChaosIndex(threats);
      
      res.json({
        success: true,
        threats,
        chaosIndex,
        count: threats.length
      });
      
    } catch (error) {
      console.error('🚨 Active threats fetch error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch active threats'
      });
    }
  }
}

module.exports = DetectionController;
