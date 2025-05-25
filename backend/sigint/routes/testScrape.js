
const express = require('express');
const router = express.Router();
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

// Test RSS scraping
router.get('/rss', async (req, res) => {
  try {
    logger.info('🧪 Testing RSS scraping');
    const threats = await rssScraper.scrapeAllSources(rssSources);
    
    res.json({
      success: true,
      scraper: 'RSS',
      threatsFound: threats.length,
      threats: threats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`RSS test failed: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Test API scraping
router.get('/api', async (req, res) => {
  try {
    logger.info('🧪 Testing API scraping');
    const threats = await apiScraper.scrapeAllSources(apiSources);
    
    res.json({
      success: true,
      scraper: 'API',
      threatsFound: threats.length,
      threats: threats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`API test failed: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Test HTML scraping
router.get('/html', async (req, res) => {
  try {
    logger.info('🧪 Testing HTML scraping');
    const threats = await htmlScraper.scrapeAllSources(htmlSources);
    
    res.json({
      success: true,
      scraper: 'HTML',
      threatsFound: threats.length,
      threats: threats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`HTML test failed: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Test Reddit scraping
router.get('/reddit', async (req, res) => {
  try {
    logger.info('🧪 Testing Reddit scraping');
    const threats = await redditScraper.scrapeAllSubreddits();
    
    res.json({
      success: true,
      scraper: 'Reddit',
      threatsFound: threats.length,
      threats: threats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Reddit test failed: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Test forwarding to detect endpoint
router.post('/forward-to-detect', async (req, res) => {
  try {
    const { threats } = req.body;
    
    if (!threats || !Array.isArray(threats)) {
      return res.status(400).json({ error: 'threats array required' });
    }

    logger.info(`🧪 Testing forward to detect: ${threats.length} threats`);
    
    const coreUrl = process.env.CORE_BACKEND_URL || 'http://localhost:3000';
    const axios = require('axios');
    const results = [];

    for (const threat of threats) {
      try {
        const response = await axios.post(`${coreUrl}/api/detect`, threat, {
          timeout: 5000,
          headers: { 'Content-Type': 'application/json' }
        });
        results.push({ success: true, threat: threat.title, status: response.status });
      } catch (error) {
        results.push({ success: false, threat: threat.title, error: error.message });
      }
    }
    
    res.json({
      success: true,
      coreUrl,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Forward test failed: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Run all scrapers at once
router.get('/all', async (req, res) => {
  try {
    logger.info('🧪 Testing all scrapers');
    
    const [rssThreats, apiThreats, htmlThreats, redditThreats] = await Promise.all([
      rssScraper.scrapeAllSources(rssSources),
      apiScraper.scrapeAllSources(apiSources),
      htmlScraper.scrapeAllSources(htmlSources),
      redditScraper.scrapeAllSubreddits()
    ]);
    
    const totalThreats = rssThreats.length + apiThreats.length + htmlThreats.length + redditThreats.length;
    
    res.json({
      success: true,
      totalThreats,
      breakdown: {
        rss: rssThreats.length,
        api: apiThreats.length,
        html: htmlThreats.length,
        reddit: redditThreats.length
      },
      threats: {
        rss: rssThreats,
        api: apiThreats,
        html: htmlThreats,
        reddit: redditThreats
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`All scrapers test failed: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
