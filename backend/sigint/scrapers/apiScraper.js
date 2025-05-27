
const axios = require('axios');
const logger = require('../utils/logger');
const threatFormatter = require('../utils/threatFormatter');

class APIScraper {
  constructor() {
    this.timeout = 15000;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
    
    // GDELT with rate limiting
    if (sources.gdelt) {
      const threats = await this.scrapeGDELT(sources.gdelt);
      allThreats.push(...threats);
      await this.delay(2000);
    }

    // USGS with rate limiting
    if (sources.usgs) {
      const threats = await this.scrapeUSGS(sources.usgs);
      allThreats.push(...threats);
      await this.delay(2000);
    }

    return allThreats;
  }

  async forwardToDetectWithRetry(threat, maxRetries = 3) {
    const coreUrl = process.env.CORE_BACKEND_URL || 'http://localhost:5000';
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await axios.post(`${coreUrl}/api/detect/ingest`, threat, {
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' }
        });
        
        logger.info(`📤 Forwarded API threat: ${threat.title}`);
        return { success: true };
        
      } catch (error) {
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers['retry-after'];
          const delayMs = retryAfter ? parseInt(retryAfter) * 1000 : Math.min(1000 * Math.pow(2, attempt), 30000);
          
          logger.warn(`⏰ Rate limited, waiting ${delayMs}ms before retry ${attempt}/${maxRetries}`);
          await this.delay(delayMs);
          
          if (attempt === maxRetries) {
            logger.error(`❌ Failed to forward after ${maxRetries} attempts: ${threat.title}`);
            return { success: false, error: 'Rate limited' };
          }
          continue;
        }
        
        logger.error(`❌ Failed to forward API threat (attempt ${attempt}): ${error.message}`);
        if (attempt === maxRetries) {
          return { success: false, error: error.message };
        }
        
        const baseDelay = 1000 * Math.pow(2, attempt - 1);
        const jitter = Math.random() * 1000;
        await this.delay(baseDelay + jitter);
      }
    }
  }

  async forwardToDetect(threats) {
    if (!Array.isArray(threats)) {
      threats = [threats];
    }

    logger.info(`📤 Starting batch forward of ${threats.length} API threats`);
    const results = [];
    
    for (const threat of threats) {
      const result = await this.forwardToDetectWithRetry(threat);
      results.push(result);
      
      // Rate limiting between requests
      await this.delay(300);
    }
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    logger.info(`📊 API Forward complete: ${successful} success, ${failed} failed`);
    return results;
  }
}

module.exports = new APIScraper();
