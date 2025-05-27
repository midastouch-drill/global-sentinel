const { getFirestore, testFirebaseConnection } = require('../config/firebase');
const openRouterClient = require('../utils/openRouterClient');
const SonarPromptBuilder = require('../utils/sonarPromptBuilder');
const ChaosIndexCalculator = require('../utils/chaosIndexCalculator');
const { v4: uuidv4 } = require('uuid');

class DetectionController {
  static async detectThreats(req, res) {
    try {
      console.log('🔍 Initiating global threat detection scan...');
      
      // Test Firebase connection first
      const firebaseHealthy = await testFirebaseConnection();
      if (!firebaseHealthy) {
        console.error('🚨 Firebase connection failed - using fallback mode');
        return DetectionController.handleFirebaseFailure(res);
      }
      
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
      
      // Store in Firestore with error handling
      try {
        const batch = db.batch();
        processedThreats.forEach(threat => {
          const threatRef = db.collection('threats').doc(threat.id);
          batch.set(threatRef, threat);
        });
        
        await batch.commit();
        console.log('✅ Threats stored in Firestore successfully');
      } catch (firestoreError) {
        console.warn('⚠️ Firestore write failed, continuing with in-memory data:', firestoreError.message);
      }
      
      // Calculate current chaos index
      const chaosIndex = ChaosIndexCalculator.calculateGlobalChaosIndex(processedThreats);
      
      console.log(`✅ Detected ${processedThreats.length} threats, Chaos Index: ${chaosIndex}`);
      
      res.json({
        success: true,
        threats: processedThreats,
        chaosIndex,
        timestamp: new Date().toISOString(),
        message: `Global threat scan complete - ${processedThreats.length} active threats detected`,
        firebaseHealthy
      });
      
    } catch (error) {
      console.error('🚨 Threat detection error:', error);
      
      // Check if it's a Firebase-specific error
      if (error.message.includes('Firebase') || error.message.includes('project_id')) {
        return DetectionController.handleFirebaseFailure(res, error);
      }
      
      res.status(500).json({
        success: false,
        error: 'Threat detection system failure',
        message: error.message,
        firebaseHealthy: false
      });
    }
  }

  static async ingestThreat(req, res) {
    try {
      console.log('📥 Threat ingestion from scraper');
      
      const threat = req.body;
      
      // Validate threat data
      if (!threat.title || !threat.type || !threat.severity) {
        return res.status(400).json({
          success: false,
          error: 'Invalid threat data - missing required fields'
        });
      }

      // Test Firebase connection
      const firebaseHealthy = await testFirebaseConnection();
      if (!firebaseHealthy) {
        console.warn('⚠️ Firebase unavailable, accepting threat but not storing');
        return res.json({
          success: true,
          message: 'Threat received but Firebase unavailable',
          firebaseHealthy: false
        });
      }

      const db = getFirestore();
      
      // Add metadata to threat
      const processedThreat = {
        ...threat,
        id: threat.id || uuidv4(),
        timestamp: new Date().toISOString(),
        status: 'active',
        votes: { confirm: 0, deny: 0, skeptical: 0 },
        source: 'scraper'
      };

      // Store in Firestore
      const threatRef = db.collection('threats').doc(processedThreat.id);
      await threatRef.set(processedThreat);
      
      console.log(`✅ Threat ingested: ${processedThreat.title}`);
      
      res.json({
        success: true,
        message: 'Threat successfully ingested',
        threatId: processedThreat.id,
        firebaseHealthy: true
      });
      
    } catch (error) {
      console.error('🚨 Threat ingestion error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to ingest threat',
        message: error.message
      });
    }
  }

  static async handleFirebaseFailure(res, error = null) {
    console.log('🔄 Running in fallback mode without Firebase...');
    
    const fallbackThreats = DetectionController.generateFallbackThreats();
    const chaosIndex = ChaosIndexCalculator.calculateGlobalChaosIndex(fallbackThreats);
    
    return res.json({
      success: true,
      threats: fallbackThreats,
      chaosIndex,
      timestamp: new Date().toISOString(),
      message: 'Threat detection running in fallback mode - Firebase unavailable',
      firebaseHealthy: false,
      firebaseError: error?.message || 'Firebase connection failed'
    });
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
        id: uuidv4(),
        title: "AI-powered disinformation campaigns targeting elections",
        type: "Cyber",
        severity: 78,
        summary: "Sophisticated deepfake and AI-generated content spreading across social platforms",
        regions: ["North America", "Europe"],
        sources: ["reuters.com", "bbc.com"],
        timestamp: new Date().toISOString(),
        status: 'active',
        votes: { confirm: 0, deny: 0, skeptical: 0 }
      },
      {
        id: uuidv4(),
        title: "Climate-induced migration crisis building in Central Asia",
        type: "Climate", 
        severity: 71,
        summary: "Unprecedented drought conditions forcing population displacement",
        regions: ["Central Asia"],
        sources: ["un.org", "who.int"],
        timestamp: new Date().toISOString(),
        status: 'active',
        votes: { confirm: 0, deny: 0, skeptical: 0 }
      }
    ];
  }

  static async getActiveThreats(req, res) {
    try {
      // Test Firebase connection first
      const firebaseHealthy = await testFirebaseConnection();
      if (!firebaseHealthy) {
        console.warn('⚠️ Firebase unavailable, returning fallback threats');
        const fallbackThreats = DetectionController.generateFallbackThreats();
        const chaosIndex = ChaosIndexCalculator.calculateGlobalChaosIndex(fallbackThreats);
        
        return res.json({
          success: true,
          threats: fallbackThreats,
          chaosIndex,
          count: fallbackThreats.length,
          firebaseHealthy: false
        });
      }

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
        count: threats.length,
        firebaseHealthy: true
      });
      
    } catch (error) {
      console.error('🚨 Active threats fetch error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch active threats',
        firebaseHealthy: false
      });
    }
  }
}

module.exports = DetectionController;
