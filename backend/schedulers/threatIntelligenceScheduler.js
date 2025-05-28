
const cron = require('node-cron');
const smartScrapingService = require('../services/smartScrapingService');
const logger = require('../utils/logger');

class ThreatIntelligenceScheduler {
  constructor() {
    this.jobs = [];
    this.isActive = false;
  }

  start() {
    logger.info('🕐 Starting intelligent threat scraping schedule');

    // More frequent scraping for development - every 5 minutes
    const mainScrapeJob = cron.schedule('*/5 * * * *', async () => {
      logger.info('⏰ Periodic scrape cycle triggered');
      await smartScrapingService.runIntelligentScrape();
    }, {
      scheduled: false,
      timezone: "UTC"
    });

    // Health check every 2 hours
    const healthJob = cron.schedule('0 */2 * * *', () => {
      const status = smartScrapingService.getStatus();
      logger.info(`💓 Intelligence Health Check - Last scrape: ${status.lastScrapeTime || 'Never'}`);
      logger.info(`💓 System status: ${status.isRunning ? 'SCRAPING' : 'STANDBY'}`);
    }, {
      scheduled: false,
      timezone: "UTC"
    });

    this.jobs.push(mainScrapeJob, healthJob);

    // Start all jobs
    this.jobs.forEach(job => job.start());
    this.isActive = true;
    
    logger.info('✅ Threat intelligence scheduler activated');
    
    // Run initial scrape after 30 seconds to allow backend to start
    setTimeout(async () => {
      logger.info('🎯 Running initial intelligence gathering...');
      await smartScrapingService.runIntelligentScrape();
    }, 30000);
  }

  stop() {
    logger.info('🛑 Stopping threat intelligence scheduler');
    this.jobs.forEach(job => job.stop());
    this.jobs = [];
    this.isActive = false;
  }

  getStatus() {
    return {
      active: this.isActive,
      jobCount: this.jobs.length,
      scrapeStatus: smartScrapingService.getStatus()
    };
  }
}

module.exports = new ThreatIntelligenceScheduler();
