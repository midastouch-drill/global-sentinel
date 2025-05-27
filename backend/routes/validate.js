
const express = require('express');
const router = express.Router();

// POST /api/validate - Citizen validation of threats
router.post('/', async (req, res) => {
  try {
    console.log('🔍 Processing citizen validation...');
    
    const { threatId, vote, userId, reasoning } = req.body;
    
    if (!threatId || !vote) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: threatId, vote'
      });
    }

    // Simulate validation processing
    const validationResult = {
      threatId,
      vote,
      userId: userId || `citizen_${Date.now()}`,
      reasoning: reasoning || 'No reasoning provided',
      timestamp: new Date().toISOString(),
      credibilityScore: vote === 'credible' ? 85 : 25,
      processed: true
    };

    console.log(`✅ Citizen validation processed for threat: ${threatId}`);
    
    res.json({
      success: true,
      validation: validationResult,
      message: 'Validation recorded successfully'
    });

  } catch (error) {
    console.error('❌ Citizen validation failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
