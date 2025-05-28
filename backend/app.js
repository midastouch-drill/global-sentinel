
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Initialize Firebase first
require('./config/firebase');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourproductiondomain.com'] 
    : ['http://localhost:8080', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/detect', require('./routes/detection'));
app.use('/api/crisis', require('./routes/crisis'));
app.use('/api/simulate', require('./routes/simulate'));
app.use('/api/simulation', require('./routes/simulation'));
app.use('/api/vote', require('./routes/vote'));
app.use('/api/verify', require('./routes/verify'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Global Sentinel Core API is operational'
  });
});

// 404 handler
app.use('/api/*', (req, res) => {
  console.log(`❌ 404 - API endpoint not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    success: false,
    error: 'API endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

module.exports = app;
