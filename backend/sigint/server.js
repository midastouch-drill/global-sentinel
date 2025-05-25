
const app = require('./app');
const logger = require('./utils/logger');
const scheduledScrape = require('./jobs/scheduledScrape');

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  logger.info(`🔍 Global Sentinel SIGINT Server running on port ${PORT}`);
  logger.info(`📡 Signal Intelligence Collection ACTIVE`);
  logger.info(`🕸️ Web scrapers standing by...`);
  
  // Start scheduled scraping jobs
  scheduledScrape.startAll();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('💀 SIGINT Server terminated');
  });
});

module.exports = server;
