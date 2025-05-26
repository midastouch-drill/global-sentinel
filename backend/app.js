
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import Firebase test function
const { testFirebaseConnection } = require('./config/firebase');

// Import routes
const detectionRoutes = require('./routes/detection');
const simulateRoutes = require('./routes/simulate');
const verifyRoutes = require('./routes/verify');
const voteRoutes = require('./routes/vote');
const trendsRoutes = require('./routes/trends');

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
      message: firebaseHealthy ? 'Firebase connection successful' : 'Firebase connection failed'
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

// API routes
app.use('/api/detect', detectionRoutes);
app.use('/api/simulate', simulateRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/vote', voteRoutes);
app.use('/api/trends', trendsRoutes);

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
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Critical system failure detected'
  });
});

module.exports = app;
