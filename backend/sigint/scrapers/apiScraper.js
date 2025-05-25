
const axios = require('axios');
const logger = require('../utils/logger');
const threatFormatter = require('../utils/threatFormatter');

class APIScraper {
  constructor() {
    this.timeout = 15000;
  }

  async scrapeGDELT(config) {
    try {
      logger.info(`🔍 Scraping API: ${config.name}`);
      
      const response = await axios.get(config.baseUrl, {
        params: config.params,
        timeout: this.timeout
      });

      const threats = [];
      const articles = response.data.articles || [];

      for (const article of articles.slice(0, 15)) {
        const threat = threatFormatter.formatGDELTArticle(article, config);
        if (threat && threatFormatter.isRelevantThreat(threat)) {
          threats.push(threat);
        }
      }

      logger.info(`✅ GDELT: Found ${threats.length} relevant threats`);
      return threats;

    } catch (error) {
      logger.error(`❌ GDELT scraping failed: ${error.message}`);
      return [];
    }
  }

  async scrapeUSGS(config) {
    try {
      logger.info(`🔍 Scraping API: ${config.name}`);
      
      const response = await axios.get(config.baseUrl, {
        timeout: this.timeout
      });

      const threats = [];
      const features = response.data.features || [];

      for (const earthquake of features) {
        const threat = threatFormatter.formatUSGSEarthquake(earthquake, config);
        if (threat && threatFormatter.isRelevantThreat(threat)) {
          threats.push(threat);
        }
      }

      logger.info(`✅ USGS: Found ${threats.length} relevant threats`);
      return threats;

    } catch (error) {
      logger.error(`❌ USGS scraping failed: ${error.message}`);
      return [];
    }
  }

  async scrapeAllSources(sources) {
    const allThreats = [];
    
    // GDELT
    if (sources.gdelt) {
      const threats = await this.scrapeGDELT(sources.gdelt);
      allThreats.push(...threats);
    }

    // USGS
    if (sources.usgs) {
      const threats = await this.scrapeUSGS(sources.usgs);
      allThreats.push(...threats);
    }

    return allThreats;
  }

  async forwardToDetect(threats) {
    const coreUrl = process.env.CORE_BACKEND_URL || 'http://localhost:3000';
    
    for (const threat of threats) {
      try {
        await axios.post(`${coreUrl}/api/detect`, threat, {
          timeout: 5000,
          headers: { 'Content-Type': 'application/json' }
        });
        logger.info(`📤 Forwarded API threat: ${threat.title}`);
      } catch (error) {
        logger.error(`❌ Failed to forward API threat: ${error.message}`);
      }
    }
  }
}

module.exports = new APIScraper();
