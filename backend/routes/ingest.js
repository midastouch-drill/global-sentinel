
const express = require('express');
const { getFirestore } = require('../config/firebase');
const router = express.Router();

// POST /api/detect/ingest - Ingest threats from SIGINT scrapers
router.post('/ingest', async (req, res) => {
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
});

// GET /api/detect/active - Get active threats for frontend
router.get('/active', async (req, res) => {
  try {
    console.log('📋 Fetching active threats');
    
    const db = getFirestore();
    const threatsSnapshot = await db.collection('threats')
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    const threats = [];
    threatsSnapshot.forEach(doc => {
      threats.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(`✅ Retrieved ${threats.length} active threats`);
    
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
});

module.exports = router;
