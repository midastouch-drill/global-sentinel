
const cron = require('node-cron');
const smartScrapingService = require('../services/smartScrapingService');
const logger = require('../utils/logger');

class ThreatIntelligenceScheduler {
  constructor() {
    this.jobs = [];
    this.isActive = false;
  }

  start() {
    logger.info('🕐 Starting 12-hour intelligent threat scraping schedule');

    // Every 12 hours at 6 AM and 6 PM UTC
    const mainScrapeJob = cron.schedule('0 6,18 * * *', async () => {
      logger.info('⏰ 12-hour scrape cycle triggered');
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
    
    // Run initial scrape after 10 seconds
    setTimeout(async () => {
      logger.info('🎯 Running initial intelligence gather...');
      await smartScrapingService.runIntelligentScrape();
    }, 10000);
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
