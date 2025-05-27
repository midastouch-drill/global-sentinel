
const express = require('express');
const router = express.Router();

// GET /health - Health check endpoint
router.get('/', (req, res) => {
  try {
    console.log('🔍 Health check requested');
    
    res.json({
      status: 'healthy',
      service: 'Global Sentinel Backend',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      firebase: 'connected',
      endpoints: {
        threats: '/api/detect/threats',
        ingest: '/api/detect/ingest',
        simulate: '/api/simulate',
        validate: '/api/validate',
        crisis: '/api/crisis',
        verify: '/api/verify'
      }
    });
    
  } catch (error) {
    console.error('❌ Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
