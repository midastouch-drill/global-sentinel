
const Parser = require('rss-parser');
const logger = require('../utils/logger');
const threatFormatter = require('../utils/threatFormatter');
const axios = require('axios');

class RSScraper {
  constructor() {
    this.parser = new Parser({
      timeout: 10000,
      customFields: {
        item: ['pubDate', 'description', 'link', 'guid']
      }
    });
    this.forwardQueue = [];
    this.isForwarding = false;
  }

  // Add delay utility
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async scrapeSource(source) {
    try {
      logger.info(`🔍 Scraping RSS: ${source.name}`);
      
      const feed = await this.parser.parseURL(source.url);
      const threats = [];

      for (const item of feed.items.slice(0, 10)) { // Limit to 10 most recent
        const threat = threatFormatter.formatRSSItem(item, source);
        if (threat && threatFormatter.isRelevantThreat(threat)) {
          threats.push(threat);
        }
      }

      logger.info(`✅ RSS ${source.name}: Found ${threats.length} relevant threats`);
      return threats;

    } catch (error) {
      logger.error(`❌ RSS scraping failed for ${source.name}: ${error.message}`);
      return [];
    }
  }

  async scrapeAllSources(sources) {
    const allThreats = [];
    
    for (const category in sources) {
      for (const source of sources[category]) {
        const threats = await this.scrapeSource(source);
        allThreats.push(...threats);
        
        // Rate limiting between sources
        await this.delay(2000);
      }
    }

    return allThreats;
  }

  async forwardToDetectWithRetry(threat, maxRetries = 3) {
    const coreUrl = process.env.CORE_BACKEND_URL || 'http://localhost:5000';
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await axios.post(`${coreUrl}/api/detect`, threat, {
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' }
        });
        
        logger.info(`📤 Forwarded threat: ${threat.title}`);
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
        
        logger.error(`❌ Failed to forward threat (attempt ${attempt}): ${error.message}`);
        if (attempt === maxRetries) {
          return { success: false, error: error.message };
        }
        
        // Exponential backoff with jitter
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

    logger.info(`📤 Starting batch forward of ${threats.length} threats`);
    const results = [];
    
    for (const threat of threats) {
      const result = await this.forwardToDetectWithRetry(threat);
      results.push(result);
      
      // Rate limiting between requests (300ms as requested)
      await this.delay(300);
    }
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    logger.info(`📊 Forward complete: ${successful} success, ${failed} failed`);
    return results;
  }
}

module.exports = new RSScraper();
