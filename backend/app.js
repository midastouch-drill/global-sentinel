
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { testFirebaseConnection } = require('./config/firebase');

require('dotenv').config();

const app = express();

// Rate limiting middleware - more permissive for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increased limit for development
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Import routes
const healthRoutes = require('./routes/health');
const detectionRoutes = require('./routes/detection');
const simulateRoutes = require('./routes/simulate');
const sigintRoutes = require('./routes/sigint');
const analysisRoutes = require('./routes/analysis');
const validateRoutes = require('./routes/validate');
const crisisRoutes = require('./routes/crisis');

// Middleware setup
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(limiter);

// Routes - Including new validation and crisis routes
app.use('/health', healthRoutes);
app.use('/api/detect', detectionRoutes);
app.use('/api/simulate', simulateRoutes);
app.use('/api/sigint', sigintRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/validate', validateRoutes);
app.use('/api/crisis', crisisRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});

module.exports = app;
