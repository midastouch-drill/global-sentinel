
const express = require('express');
const { getFirestore } = require('../config/firebase');
const router = express.Router();

// POST /api/verify - Verify a threat
router.post('/', async (req, res) => {
  try {
    console.log('🔍 Processing threat verification...');
    
    const { threatId, sources, credibilityScore, userId = 'anonymous' } = req.body;
    
    if (!threatId || !sources || !credibilityScore) {
      return res.status(400).json({
        success: false,
        error: 'Threat ID, sources, and credibility score are required'
      });
    }

    const db = getFirestore();
    const threatRef = db.collection('threats').doc(threatId);
    
    // Get current threat data
    const threatDoc = await threatRef.get();
    if (!threatDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Threat not found'
      });
    }

    const threatData = threatDoc.data();
    const verifiedBy = threatData.verifiedBy || [];
    
    // Add verification record
    const verification = {
      userId,
      sources,
      credibilityScore,
      timestamp: new Date().toISOString()
    };
    
    verifiedBy.push(verification);
    
    // Update threat with verification
    await threatRef.update({
      verifiedBy,
      confidence: Math.max(threatData.confidence || 70, credibilityScore),
      updatedAt: new Date().toISOString()
    });

    console.log(`✅ Threat verified: ${threatId}`);
    
    res.json({
      success: true,
      message: 'Threat verified successfully',
      verification
    });

  } catch (error) {
    console.error('❌ Threat verification failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify threat'
    });
  }
});

module.exports = router;
