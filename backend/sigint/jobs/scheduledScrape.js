
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
      let totalSuccessful = 0;
      let totalFailed = 0;

      // RSS Sources
      logger.info('📡 Processing RSS sources...');
      const rssThreats = await rssScraper.scrapeAllSources(rssSources);
      const rssResults = await rssScraper.forwardToDetect(rssThreats);
      totalThreats += rssThreats.length;
      totalSuccessful += rssResults.filter(r => r.success).length;
      totalFailed += rssResults.filter(r => !r.success).length;

      // API Sources  
      logger.info('🔌 Processing API sources...');
      const apiThreats = await apiScraper.scrapeAllSources(apiSources);
      const apiResults = await apiScraper.forwardToDetect(apiThreats);
      totalThreats += apiThreats.length;
      totalSuccessful += apiResults.filter(r => r.success).length;
      totalFailed += apiResults.filter(r => !r.success).length;

      // HTML Sources
      logger.info('🕸️ Processing HTML sources...');
      const htmlThreats = await htmlScraper.scrapeAllSources(htmlSources);
      const htmlResults = await htmlScraper.forwardToDetect(htmlThreats);
      totalThreats += htmlThreats.length;
      totalSuccessful += htmlResults.filter(r => r.success).length;
      totalFailed += htmlResults.filter(r => !r.success).length;

      // Reddit Sources
      logger.info('🟠 Processing Reddit sources...');
      const redditThreats = await redditScraper.scrapeAllSubreddits();
      const redditResults = await redditScraper.forwardToDetect(redditThreats);
      totalThreats += redditThreats.length;
      totalSuccessful += redditResults.filter(r => r.success).length;
      totalFailed += redditResults.filter(r => !r.success).length;

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      logger.info(`✅ Scrape cycle completed: ${totalThreats} threats processed in ${duration}s`);
      logger.info(`📊 Overall results: ${totalSuccessful} successful forwards, ${totalFailed} failed forwards`);

      if (totalFailed > 0) {
        logger.warn(`⚠️ ${totalFailed} threats failed to forward - check Core Backend connection`);
      }

    } catch (error) {
      logger.error(`❌ Scrape cycle failed: ${error.message}`);
      logger.error(`   Stack trace: ${error.stack}`);
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
      logger.info(`💓 Current status: ${this.isRunning ? 'SCRAPING' : 'IDLE'}`);
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
      logger.info('🎯 Running initial scrape cycle...');
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
