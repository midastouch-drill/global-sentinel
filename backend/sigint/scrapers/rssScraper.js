
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
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
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
        logger.info(`📤 Forwarded threat: ${threat.title}`);
      } catch (error) {
        logger.error(`❌ Failed to forward threat: ${error.message}`);
      }
    }
  }
}

module.exports = new RSScraper();
