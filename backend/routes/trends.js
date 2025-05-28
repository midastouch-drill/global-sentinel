
const express = require('express');
const router = express.Router();

// GET /api/trends - Get threat trends
router.get('/', (req, res) => {
  try {
    console.log('📊 Fetching threat trends');
    
    // Mock trends data for now
    const trends = {
      daily: [
        { date: '2024-01-01', cyber: 12, climate: 8, health: 5, economic: 3, conflict: 7 },
        { date: '2024-01-02', cyber: 15, climate: 9, health: 4, economic: 5, conflict: 6 },
        { date: '2024-01-03', cyber: 18, climate: 7, health: 6, economic: 4, conflict: 8 },
        { date: '2024-01-04', cyber: 14, climate: 10, health: 3, economic: 6, conflict: 5 },
        { date: '2024-01-05', cyber: 20, climate: 12, health: 7, economic: 8, conflict: 9 }
      ],
      weekly: {
        cyber: { current: 79, previous: 65, change: 21.5 },
        climate: { current: 46, previous: 52, change: -11.5 },
        health: { current: 25, previous: 18, change: 38.9 },
        economic: { current: 26, previous: 31, change: -16.1 },
        conflict: { current: 35, previous: 28, change: 25.0 }
      },
      regions: [
        { region: 'North America', threats: 45, severity: 72 },
        { region: 'Europe', threats: 38, severity: 68 },
        { region: 'Asia', threats: 52, severity: 75 },
        { region: 'Africa', threats: 29, severity: 64 },
        { region: 'South America', threats: 22, severity: 59 }
      ]
    };
    
    res.json({
      success: true,
      trends,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Trends fetch failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trends'
    });
  }
});

module.exports = router;
