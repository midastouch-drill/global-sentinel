
const app = require('./app');
const { testFirebaseConnection } = require('./config/firebase');

const port = process.env.PORT || 5000;

const startServer = async () => {
  console.log('🌍 Starting Global Sentinel Backend...');
  
  // Test Firebase connection on startup
  console.log('🔄 Testing Firebase connection...');
  const firebaseHealthy = await testFirebaseConnection();
  
  if (firebaseHealthy) {
    console.log('✅ Firebase connection: HEALTHY');
  } else {
    console.warn('⚠️  Firebase connection: FAILED - Running in fallback mode');
    console.warn('   Check your .env file and Firebase credentials');
  }
  
  const server = app.listen(port, () => {
    console.log(`🌍 Global Sentinel Backend running on port ${port}`);
    console.log(`🚀 Earth's AI Immune System is ACTIVE`);
    console.log(`📡 Monitoring global threats in real-time...`);
    console.log(`🔥 Firebase Status: ${firebaseHealthy ? 'CONNECTED' : 'DISCONNECTED'}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    
    if (!firebaseHealthy) {
      console.log('');
      console.log('🔧 TO FIX FIREBASE:');
      console.log('   1. Check your .env file exists and has all required variables');
      console.log('   2. Verify FIREBASE_PROJECT_ID matches your Firebase project');
      console.log('   3. Ensure FIREBASE_PRIVATE_KEY includes proper newlines (\\n)');
      console.log('   4. Confirm FIREBASE_CLIENT_EMAIL is correct');
      console.log('   5. Visit: /health/firebase for detailed status');
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('💀 Process terminated');
    });
  });

  return server;
};

// Start the server
startServer().catch(error => {
  console.error('🚨 Failed to start server:', error);
  process.exit(1);
});

module.exports = startServer;
