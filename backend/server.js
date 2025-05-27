
const app = require('./app');
const port = process.env.PORT || 5000;

console.log('🌍 Starting Global Sentinel Backend...');

// Start the server
const server = app.listen(port, () => {
  console.log(`🌍 Global Sentinel Backend running on port ${port}`);
  console.log('🚀 Earth\'s AI Immune System is ACTIVE');
  console.log('📡 Monitoring global threats in real-time...');
  console.log('🔥 Firebase Status: CONNECTED');
  console.log(`🌐 Frontend URL: http://localhost:8080`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('💀 Server terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('💀 Server terminated');
    process.exit(0);
  });
});

module.exports = server;
