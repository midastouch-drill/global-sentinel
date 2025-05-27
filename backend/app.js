
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import Firebase test function
const { testFirebaseConnection } = require('./config/firebase');

// Import authentication middleware
const { verifyFirebaseToken, optionalAuth } = require('./middleware/authMiddleware');

// Import routes
const detectionRoutes = require('./routes/detection');
const simulateRoutes = require('./routes/simulate');
const verifyRoutes = require('./routes/verify');
const voteRoutes = require('./routes/vote');
const trendsRoutes = require('./routes/trends');
const sigintRoutes = require('./routes/sigint');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint with Firebase status
app.get('/health', async (req, res) => {
  const firebaseHealthy = await testFirebaseConnection();
  
  res.json({
    status: 'active',
    message: '🌍 Global Sentinel operational',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      firebase: firebaseHealthy ? 'healthy' : 'unavailable',
      api: 'healthy'
    }
  });
});

// Firebase-specific health check
app.get('/health/firebase', async (req, res) => {
  try {
    const firebaseHealthy = await testFirebaseConnection();
    
    res.json({
      service: 'firebase',
      status: firebaseHealthy ? 'healthy' : 'unavailable',
      timestamp: new Date().toISOString(),
      message: firebaseHealthy ? 'Firebase connection successful' : 'Firebase connection failed',
      config: {
        projectId: process.env.FIREBASE_PROJECT_ID || 'not-set',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL ? 'configured' : 'missing',
        privateKey: process.env.FIREBASE_PRIVATE_KEY ? 'configured' : 'missing'
      }
    });
  } catch (error) {
    res.status(500).json({
      service: 'firebase',
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Public routes (no authentication required)
app.use('/api/trends', optionalAuth, trendsRoutes);
app.use('/api/sigint', sigintRoutes); // SIGINT routes are public for scraper access

// Protected routes (authentication required)
app.use('/api/detect', verifyFirebaseToken, detectionRoutes);
app.use('/api/simulate', verifyFirebaseToken, simulateRoutes);
app.use('/api/verify', verifyFirebaseToken, verifyRoutes);
app.use('/api/vote', verifyFirebaseToken, voteRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: 'This threat vector is not monitored'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🚨 Global Sentinel Error:', err);
  
  // Handle Firebase-specific errors
  if (err.message.includes('Firebase') || err.message.includes('project_id')) {
    return res.status(503).json({
      error: 'Firebase Service Unavailable',
      message: 'Firebase configuration error - check environment variables',
      details: err.message
    });
  }
  
  // Handle authentication errors
  if (err.message.includes('auth') || err.message.includes('token')) {
    return res.status(401).json({
      error: 'Authentication Failed',
      message: 'Invalid or expired authentication token'
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Critical system failure detected'
  });
});

module.exports = app;
