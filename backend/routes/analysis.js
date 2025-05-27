
const express = require('express');
const router = express.Router();

// GET /api/analysis/trends - Get trends data
router.get('/trends', async (req, res) => {
  try {
    console.log('📊 Generating trends analysis...');
    
    const trendsData = {
      threatTypes: {
        Cyber: 45,
        Health: 23,
        Climate: 18,
        Economic: 14
      },
      severityDistribution: {
        Critical: 12,
        High: 28,
        Medium: 35,
        Low: 25
      },
      regionalActivity: {
        "North America": 32,
        "Europe": 28,
        "Asia": 24,
        "Africa": 10,
        "South America": 6
      }
    };

    res.json({
      success: true,
      trends: trendsData
    });

  } catch (error) {
    console.error('❌ Trends analysis failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
