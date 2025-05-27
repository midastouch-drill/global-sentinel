
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { testFirebaseConnection } = require('./config/firebase');

require('dotenv').config();

const app = express();

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Import routes
const healthRoutes = require('./routes/health');
const detectionRoutes = require('./routes/detection');
const ingestRoutes = require('./routes/ingest');
const simulateRoutes = require('./routes/simulate');
const sigintRoutes = require('./routes/sigint');
const analysisRoutes = require('./routes/analysis');

// Middleware setup
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(limiter);

// Routes
app.use('/health', healthRoutes);
app.use('/api/detect', detectionRoutes);
app.use('/api/detect', ingestRoutes);
app.use('/api/simulate', simulateRoutes);
app.use('/api/sigint', sigintRoutes);
app.use('/api/analysis', analysisRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});

module.exports = app;
