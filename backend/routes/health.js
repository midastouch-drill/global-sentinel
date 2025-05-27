
const express = require('express');
const { testFirebaseConnection } = require('../config/firebase');
const router = express.Router();

// GET /health - Basic health check
router.get('/', async (req, res) => {
  try {
    const healthStatus = {
      status: 'HEALTHY',
      service: 'Global Sentinel Backend',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    };

    res.json(healthStatus);
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'UNHEALTHY',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /health/firebase - Firebase connection test
router.get('/firebase', async (req, res) => {
  try {
    console.log('🔥 Testing Firebase connection...');
    const isHealthy = await testFirebaseConnection();
    
    if (isHealthy) {
      res.json({
        status: 'HEALTHY',
        service: 'Firebase',
        message: 'Firebase connection successful',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'UNHEALTHY',
        service: 'Firebase',
        message: 'Firebase connection failed',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('🚨 Firebase health check error:', error);
    res.status(503).json({
      status: 'UNHEALTHY',
      service: 'Firebase',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /health/detailed - Comprehensive health check
router.get('/detailed', async (req, res) => {
  try {
    const firebaseHealthy = await testFirebaseConnection();
    
    const detailedHealth = {
      status: firebaseHealthy ? 'HEALTHY' : 'DEGRADED',
      service: 'Global Sentinel Backend',
      timestamp: new Date().toISOString(),
      checks: {
        firebase: {
          status: firebaseHealthy ? 'HEALTHY' : 'UNHEALTHY',
          message: firebaseHealthy ? 'Connected' : 'Connection failed'
        },
        server: {
          status: 'HEALTHY',
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          pid: process.pid
        }
      }
    };

    const statusCode = firebaseHealthy ? 200 : 503;
    res.status(statusCode).json(detailedHealth);
  } catch (error) {
    console.error('Detailed health check failed:', error);
    res.status(500).json({
      status: 'UNHEALTHY',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
