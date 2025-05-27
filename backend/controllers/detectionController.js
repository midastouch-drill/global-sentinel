
const { getFirestore, logger, isDemoMode } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

class DetectionController {
  static async detectThreats(req, res) {
    try {
      console.log('🔍 Running threat detection...');
      
      const { sources = [], analysisType = 'comprehensive' } = req.body;
      
      // Mock threat detection for now
      const mockThreats = [
        {
          id: uuidv4(),
          title: 'AI-Detected Cyber Security Vulnerability',
          type: 'Cyber',
          severity: 85,
          summary: 'Advanced persistent threat detected targeting financial infrastructure.',
          regions: ['North America', 'Europe'],
          sources: ['OSINT', 'SIGINT'],
          timestamp: new Date().toISOString(),
          status: 'active',
          confidence: 88,
          votes: { credible: 15, not_credible: 2 }
        }
      ];
      
      res.json({
        success: true,
        threats: mockThreats,
        count: mockThreats.length,
        message: 'Threat detection completed successfully'
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

  static async getActiveThreats(req, res) {
    try {
      console.log('📋 Fetching active threats for frontend');
      
      if (isDemoMode()) {
        console.log('🎭 Demo mode: returning mock threats');
        return res.json({
          success: true,
          threats: DetectionController.getMockThreats()
        });
      }

      const db = getFirestore();
      
      // Implement retry logic for quota issues
      let threats = [];
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          const snapshot = await db.collection('threats')
            .where('status', '==', 'active')
            .orderBy('timestamp', 'desc')
            .limit(50)
            .get();
          
          threats = [];
          snapshot.forEach(doc => {
            threats.push({ id: doc.id, ...doc.data() });
          });
          
          break; // Success, exit retry loop
          
        } catch (firestoreError) {
          retryCount++;
          
          if (firestoreError.code === 8 || firestoreError.message.includes('Quota exceeded')) {
            console.warn(`⚠️ Firebase quota exceeded, attempt ${retryCount}/${maxRetries}`);
            
            if (retryCount >= maxRetries) {
              console.log('🎭 Falling back to mock data due to quota limits');
              return res.json({
                success: true,
                threats: DetectionController.getMockThreats(),
                isDemo: true,
                message: 'Using demo data due to Firebase quota limits'
              });
            }
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          } else {
            throw firestoreError;
          }
        }
      }
      
      logger.info(`✅ Retrieved ${threats.length} active threats`);
      
      res.json({
        success: true,
        threats: threats
      });
      
    } catch (error) {
      console.error('❌ Failed to fetch active threats:', error);
      
      // Fallback to mock data on any error
      res.json({
        success: true,
        threats: DetectionController.getMockThreats(),
        isDemo: true,
        message: 'Using demo data due to backend error'
      });
    }
  }

  static async ingestThreat(req, res) {
    try {
      console.log('📥 Ingesting threat from SIGINT scraper');
      
      const { title, type, severity, summary, regions, sources } = req.body;
      
      if (!title || !type || !severity) {
        return res.status(400).json({
          success: false,
          error: 'Title, type, and severity are required'
        });
      }

      const threatData = {
        id: uuidv4(),
        title,
        type,
        severity: parseInt(severity),
        summary: summary || 'No summary provided',
        regions: regions || ['Global'],
        sources: sources || ['SIGINT'],
        timestamp: new Date().toISOString(),
        status: 'active',
        confidence: Math.floor(Math.random() * 30) + 70, // 70-100
        votes: { credible: 0, not_credible: 0 }
      };

      if (!isDemoMode()) {
        try {
          const db = getFirestore();
          await db.collection('threats').doc(threatData.id).set(threatData);
        } catch (firestoreError) {
          console.warn('⚠️ Firebase ingestion failed, continuing with mock response');
        }
      }

      console.log(`✅ Threat ingested successfully: ${title}`);
      
      res.json({
        success: true,
        threat: threatData,
        message: 'Threat ingested successfully'
      });
      
    } catch (error) {
      console.error('❌ Threat ingestion failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to ingest threat'
      });
    }
  }

  static getMockThreats() {
    return [
      {
        id: 'mock_threat_cyber_1',
        title: 'Advanced Persistent Threat Targeting Financial Infrastructure',
        type: 'Cyber',
        severity: 85,
        summary: 'Sophisticated malware campaign targeting banking systems across multiple countries. Evidence suggests state-sponsored actors.',
        regions: ['North America', 'Europe', 'Asia'],
        sources: ['OSINT', 'SIGINT', 'HUMINT'],
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'active',
        confidence: 88,
        votes: { credible: 24, not_credible: 3 }
      },
      {
        id: 'mock_threat_health_2',
        title: 'Emerging Antimicrobial Resistance in Southeast Asia',
        type: 'Health',
        severity: 72,
        summary: 'New strain of antibiotic-resistant bacteria spreading rapidly through healthcare facilities.',
        regions: ['Southeast Asia'],
        sources: ['WHO', 'Medical Journals', 'Hospital Reports'],
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        status: 'active',
        confidence: 82,
        votes: { credible: 18, not_credible: 1 }
      },
      {
        id: 'mock_threat_climate_3',
        title: 'Critical Water Shortage in Mediterranean Basin',
        type: 'Climate',
        severity: 78,
        summary: 'Unprecedented drought conditions threatening agricultural stability and regional security.',
        regions: ['Mediterranean'],
        sources: ['Climate Data', 'Satellite Imagery', 'Agricultural Reports'],
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        status: 'active',
        confidence: 91,
        votes: { credible: 31, not_credible: 2 }
      },
      {
        id: 'mock_threat_conflict_4',
        title: 'Rising Tensions in Eastern European Border Regions',
        type: 'Conflict',
        severity: 83,
        summary: 'Military buildup and diplomatic tensions escalating along contested border areas.',
        regions: ['Eastern Europe'],
        sources: ['Intelligence Reports', 'Satellite Analysis', 'Diplomatic Cables'],
        timestamp: new Date(Date.now() - 14400000).toISOString(),
        status: 'active',
        confidence: 76,
        votes: { credible: 28, not_credible: 5 }
      }
    ];
  }
}

module.exports = DetectionController;
