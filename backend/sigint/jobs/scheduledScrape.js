const cron = require('node-cron');
const logger = require('../utils/logger');
const smartScrapingService = require('../services/smartScrapingService');

// Import scrapers
const rssScraper = require('../scrapers/rssScraper');
const apiScraper = require('../scrapers/apiScraper');
const htmlScraper = require('../scrapers/htmlScraper');
const redditScraper = require('../scrapers/redditScraper');

// Import source configs
const rssSources = require('../config/rssSources');
const apiSources = require('../config/apiSources');
const htmlSources = require('../config/htmlSources');

class ScheduledScrape {
  constructor() {
    this.jobs = [];
    this.isRunning = false;
  }

  async runFullScrape() {
    // Delegate to the new smart scraping service
    return await smartScrapingService.runIntelligentScrape();
  }

  startAll() {
    logger.info('⏰ Setting up intelligent 12-hour scraping schedule');

    // Main intelligent scrape every 12 hours
    const mainJob = cron.schedule('0 6,18 * * *', () => {
      this.runFullScrape();
    }, {
      scheduled: false,
      timezone: "UTC"
    });

    // Health check every 2 hours
    const healthJob = cron.schedule('0 */2 * * *', () => {
      const status = smartScrapingService.getStatus();
      logger.info(`💓 SIGINT Health Check - Smart scraping: ${status.isRunning ? 'ACTIVE' : 'STANDBY'}`);
      logger.info(`💓 Last intelligence update: ${status.lastScrapeTime || 'Initializing'}`);
    }, {
      scheduled: false,
      timezone: "UTC"
    });

    this.jobs.push(mainJob, healthJob);

    // Start all jobs
    this.jobs.forEach(job => job.start());
    
    logger.info('✅ Intelligent scraping schedule activated');
    
    // Run initial scrape after 30 seconds
    setTimeout(() => {
      logger.info('🎯 Running initial intelligence gathering...');
      this.runFullScrape();
    }, 30000);
  }

  stopAll() {
    logger.info('🛑 Stopping all scheduled jobs');
    this.jobs.forEach(job => job.stop());
    this.jobs = [];
  }

  getStatus() {
    return {
      totalJobs: this.jobs.length,
      isRunning: this.isRunning,
      activeJobs: this.jobs.filter(job => job.running).length
    };
  }
}

module.exports = new ScheduledScrape();
