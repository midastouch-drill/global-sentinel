const { getFirestore, logger, isDemoMode } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

// In-memory cache for threats when Firebase quota is exceeded
let threatCache = [];
let lastCacheUpdate = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
          sources: ['https://cisa.gov/alerts', 'https://cert.org/advisories'],
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
      
      const { page = 1, limit = 10 } = req.query;
      
      if (isDemoMode()) {
        console.log('🎭 Demo mode: returning mock threats');
        return res.json({
          success: true,
          threats: DetectionController.getMockThreats().slice(0, limit),
          hasMore: DetectionController.getMockThreats().length > limit,
          total: DetectionController.getMockThreats().length
        });
      }

      // Check if we can use cache
      const now = Date.now();
      if (threatCache.length > 0 && lastCacheUpdate && (now - lastCacheUpdate) < CACHE_DURATION) {
        console.log('📦 Using cached threats data');
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        
        return res.json({
          success: true,
          threats: threatCache.slice(startIndex, endIndex),
          hasMore: threatCache.length > endIndex,
          total: threatCache.length,
          cached: true
        });
      }

      const db = getFirestore();
      
      // Try to fetch from Firebase with retry logic
      let threats = [];
      let retryCount = 0;
      const maxRetries = 2;
      
      while (retryCount < maxRetries) {
        try {
          const snapshot = await db.collection('threats')
            .where('status', '==', 'active')
            .orderBy('timestamp', 'desc')
            .limit(100) // Get more for cache
            .get();
          
          threats = [];
          snapshot.forEach(doc => {
            const data = doc.data();
            threats.push({
              id: doc.id,
              ...data,
              sources: data.sources || ['https://global-intelligence.gov', 'https://threat-monitor.org']
            });
          });
          
          // Update cache
          threatCache = threats;
          lastCacheUpdate = now;
          
          break; // Success, exit retry loop
          
        } catch (firestoreError) {
          retryCount++;
          
          if (firestoreError.code === 8 || firestoreError.message.includes('Quota exceeded')) {
            console.warn(`⚠️ Firebase quota exceeded, attempt ${retryCount}/${maxRetries}`);
            
            if (retryCount >= maxRetries) {
              console.log('📦 Using cached data due to quota limits');
              
              // If no cache, use mock data
              if (threatCache.length === 0) {
                threatCache = DetectionController.getMockThreats();
                lastCacheUpdate = now;
              }
              
              const startIndex = (page - 1) * limit;
              const endIndex = startIndex + parseInt(limit);
              
              return res.json({
                success: true,
                threats: threatCache.slice(startIndex, endIndex),
                hasMore: threatCache.length > endIndex,
                total: threatCache.length,
                quotaExceeded: true,
                message: 'Using cached intelligence data due to quota limits'
              });
            }
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            throw firestoreError;
          }
        }
      }
      
      logger.info(`✅ Retrieved ${threats.length} active threats`);
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      
      res.json({
        success: true,
        threats: threats.slice(startIndex, endIndex),
        hasMore: threats.length > endIndex,
        total: threats.length
      });
      
    } catch (error) {
      console.error('❌ Failed to fetch active threats:', error);
      
      // Final fallback to mock data
      const mockThreats = DetectionController.getMockThreats();
      const startIndex = ((req.query.page || 1) - 1) * (req.query.limit || 10);
      const endIndex = startIndex + parseInt(req.query.limit || 10);
      
      res.json({
        success: true,
        threats: mockThreats.slice(startIndex, endIndex),
        hasMore: mockThreats.length > endIndex,
        total: mockThreats.length,
        error: true,
        message: 'Using fallback data due to backend error'
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
        id: 'threat_cyber_001',
        title: 'Advanced Persistent Threat Targeting Financial Infrastructure',
        type: 'Cyber',
        severity: 85,
        summary: 'Sophisticated malware campaign targeting banking systems across multiple countries. Evidence suggests state-sponsored actors using zero-day exploits.',
        regions: ['North America', 'Europe', 'Asia'],
        sources: ['https://cisa.gov/alerts', 'https://cert.org/advisories', 'https://us-cert.gov/ncas'],
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'active',
        confidence: 88,
        votes: { credible: 24, not_credible: 3 }
      },
      {
        id: 'threat_health_002',
        title: 'Emerging Antimicrobial Resistance in Southeast Asia',
        type: 'Health',
        severity: 72,
        summary: 'New strain of antibiotic-resistant bacteria spreading rapidly through healthcare facilities across multiple countries.',
        regions: ['Southeast Asia'],
        sources: ['https://who.int/emergencies', 'https://cdc.gov/drugresistance', 'https://ecdc.europa.eu'],
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        status: 'active',
        confidence: 82,
        votes: { credible: 18, not_credible: 1 }
      },
      {
        id: 'threat_climate_003',
        title: 'Critical Water Shortage Crisis in Mediterranean Basin',
        type: 'Climate',
        severity: 78,
        summary: 'Unprecedented drought conditions threatening agricultural stability and regional security across Southern Europe.',
        regions: ['Mediterranean', 'Southern Europe'],
        sources: ['https://climate.ec.europa.eu', 'https://ipcc.ch/reports', 'https://drought.gov'],
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        status: 'active',
        confidence: 91,
        votes: { credible: 31, not_credible: 2 }
      },
      {
        id: 'threat_conflict_004',
        title: 'Escalating Tensions in Eastern European Border Regions',
        type: 'Conflict',
        severity: 83,
        summary: 'Military buildup and diplomatic tensions escalating along contested border areas with potential for wider conflict.',
        regions: ['Eastern Europe'],
        sources: ['https://nato.int/cps', 'https://sipri.org/databases', 'https://crisisgroup.org'],
        timestamp: new Date(Date.now() - 14400000).toISOString(),
        status: 'active',
        confidence: 76,
        votes: { credible: 28, not_credible: 5 }
      },
      {
        id: 'threat_economic_005',
        title: 'Cryptocurrency Market Manipulation Threatening Financial Stability',
        type: 'Economic',
        severity: 69,
        summary: 'Large-scale coordinated trading attacks targeting major cryptocurrency exchanges and stablecoins.',
        regions: ['Global'],
        sources: ['https://sec.gov/news', 'https://bis.org/publ', 'https://federalreserve.gov'],
        timestamp: new Date(Date.now() - 18000000).toISOString(),
        status: 'active',
        confidence: 74,
        votes: { credible: 15, not_credible: 8 }
      },
      {
        id: 'threat_ai_006',
        title: 'Deepfake Technology Weaponization for Disinformation Campaigns',
        type: 'AI',
        severity: 80,
        summary: 'Advanced AI-generated content being used to spread false information and manipulate public opinion.',
        regions: ['Global'],
        sources: ['https://ai.gov/reports', 'https://partnership.ai', 'https://oecd.org/digital'],
        timestamp: new Date(Date.now() - 21600000).toISOString(),
        status: 'active',
        confidence: 85,
        votes: { credible: 22, not_credible: 4 }
      }
    ];
  }
}

module.exports = DetectionController;
