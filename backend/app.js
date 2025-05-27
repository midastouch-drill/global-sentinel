
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { initializeFirebase } = require('./config/firebase');

// Initialize Firebase (will handle missing env vars gracefully)
try {
  initializeFirebase();
  console.log('🔥 Firebase initialization completed');
} catch (error) {
  console.warn('⚠️  Firebase initialization failed, continuing in demo mode:', error.message);
}

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Set security HTTP headers
app.use(helmet());

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route imports
const detectionRoutes = require('./routes/detection');
const voteRoutes = require('./routes/vote');
const simulationRoutes = require('./routes/simulation');
const verifyRoutes = require('./routes/verify');

// Logging middleware (optional)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/detect', detectionRoutes);
app.use('/api/vote', voteRoutes);
app.use('/api/simulate', simulationRoutes);
app.use('/api/verify', verifyRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start the server
app.listen(port, () => {
  console.log(`🌍 Global Sentinel Backend running on port ${port}`);
  console.log('🚀 Earth\'s AI Immune System is ACTIVE');
  console.log('📡 Monitoring global threats in real-time...');
  console.log(`🌐 Frontend URL: http://localhost:8080`);
  console.log('💡 Create a .env file with Firebase credentials to enable database features');
});

module.exports = app;
