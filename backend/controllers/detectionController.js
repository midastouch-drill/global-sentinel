
const { getFirestore } = require('../config/firebase');

class DetectionController {
  // Simulate threat detection process
  static async detectThreats(req, res) {
    try {
      console.log('🔍 Running threat detection simulation...');
      
      const simulatedThreats = [
        {
          id: `threat_${Date.now()}_simulation`,
          title: 'Simulated Cyber Security Alert',
          type: 'Cyber',
          severity: 75,
          summary: 'AI-generated threat simulation for system testing',
          regions: ['Global'],
          sources: ['AI Simulation'],
          timestamp: new Date().toISOString(),
          status: 'active',
          confidence: 85,
          votes: { credible: 0, not_credible: 0 }
        }
      ];

      res.json({
        success: true,
        message: 'Threat detection completed',
        threatsDetected: simulatedThreats.length,
        threats: simulatedThreats
      });

    } catch (error) {
      console.error('❌ Threat detection failed:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get active threats - PUBLIC endpoint for frontend (FIXED: Remove compound query)
  static async getActiveThreats(req, res) {
    try {
      console.log('📋 Fetching active threats for frontend');
      
      const db = getFirestore();
      
      // Use simple query without compound index requirement
      const threatsSnapshot = await db.collection('threats')
        .limit(100)
        .get();

      const threats = [];
      threatsSnapshot.forEach(doc => {
        const threatData = {
          id: doc.id,
          ...doc.data()
        };
        
        // Filter active threats in code instead of query
        if (threatData.status === 'active' || !threatData.status) {
          threats.push(threatData);
        }
      });

      // Sort by timestamp in code
      threats.sort((a, b) => {
        const timeA = new Date(a.createdAt || a.timestamp || 0).getTime();
        const timeB = new Date(b.createdAt || b.timestamp || 0).getTime();
        return timeB - timeA; // Newest first
      });

      console.log(`✅ Retrieved ${threats.length} active threats for frontend`);
      
      res.json({
        success: true,
        count: threats.length,
        threats
      });

    } catch (error) {
      console.error('❌ Failed to fetch active threats:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        threats: []
      });
    }
  }

  // Ingest threats from SIGINT scrapers - PUBLIC endpoint
  static async ingestThreat(req, res) {
    try {
      console.log('📥 Ingesting threat from SIGINT scraper');
      
      const threat = req.body;
      
      // Validate required fields
      if (!threat.title || !threat.type || !threat.severity) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: title, type, severity'
        });
      }

      // Add processing metadata
      const processedThreat = {
        ...threat,
        id: threat.id || `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'active',
        confidence: threat.confidence || 70,
        verifiedBy: [],
        votes: { credible: 0, not_credible: 0 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ingestionSource: 'sigint'
      };

      // Store in Firestore
      const db = getFirestore();
      const threatRef = db.collection('threats').doc(processedThreat.id);
      await threatRef.set(processedThreat);

      console.log(`✅ Threat ingested successfully: ${processedThreat.title}`);
      
      res.json({
        success: true,
        threatId: processedThreat.id,
        message: 'Threat ingested successfully'
      });

    } catch (error) {
      console.error('❌ Threat ingestion failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        details: 'Failed to ingest threat into database'
      });
    }
  }
}

module.exports = DetectionController;
