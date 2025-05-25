
const cron = require('node-cron');
const logger = require('../utils/logger');

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
    if (this.isRunning) {
      logger.warn('⏸️ Scrape already in progress, skipping...');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();
    logger.info('🚀 Starting scheduled scrape cycle');

    try {
      let totalThreats = 0;

      // RSS Sources
      logger.info('📡 Processing RSS sources...');
      const rssThreats = await rssScraper.scrapeAllSources(rssSources);
      await rssScraper.forwardToDetect(rssThreats);
      totalThreats += rssThreats.length;

      // API Sources  
      logger.info('🔌 Processing API sources...');
      const apiThreats = await apiScraper.scrapeAllSources(apiSources);
      await apiScraper.forwardToDetect(apiThreats);
      totalThreats += apiThreats.length;

      // HTML Sources
      logger.info('🕸️ Processing HTML sources...');
      const htmlThreats = await htmlScraper.scrapeAllSources(htmlSources);
      await htmlScraper.forwardToDetect(htmlThreats);
      totalThreats += htmlThreats.length;

      // Reddit Sources
      logger.info('🟠 Processing Reddit sources...');
      const redditThreats = await redditScraper.scrapeAllSubreddits();
      await redditScraper.forwardToDetect(redditThreats);
      totalThreats += redditThreats.length;

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      logger.info(`✅ Scrape cycle completed: ${totalThreats} threats processed in ${duration}s`);

    } catch (error) {
      logger.error(`❌ Scrape cycle failed: ${error.message}`);
    } finally {
      this.isRunning = false;
    }
  }

  startAll() {
    logger.info('⏰ Setting up scheduled scraping jobs');

    // Main scrape every 10 minutes
    const mainJob = cron.schedule('*/10 * * * *', () => {
      this.runFullScrape();
    }, {
      scheduled: false,
      timezone: "UTC"
    });

    // Health check every hour
    const healthJob = cron.schedule('0 * * * *', () => {
      logger.info(`💓 SIGINT Health Check - Active scrapers: RSS, API, HTML, Reddit`);
    }, {
      scheduled: false,
      timezone: "UTC"
    });

    this.jobs.push(mainJob, healthJob);

    // Start all jobs
    this.jobs.forEach(job => job.start());
    
    logger.info('✅ All scheduled jobs started');
    
    // Run initial scrape after 30 seconds
    setTimeout(() => {
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
