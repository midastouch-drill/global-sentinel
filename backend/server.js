
const app = require('./app');
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`🌍 Global Sentinel Backend running on port ${port}`);
  console.log(`🚀 Earth's AI Immune System is ACTIVE`);
  console.log(`📡 Monitoring global threats in real-time...`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('💀 Process terminated');
  });
});

module.exports = server;
