
const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../utils/logger');
const threatFormatter = require('../utils/threatFormatter');

class HTMLScraper {
  constructor() {
    this.timeout = 10000;
    this.userAgent = 'Mozilla/5.0 (Global Sentinel SIGINT Bot)';
  }

  async scrapeSource(source) {
    try {
      logger.info(`🔍 Scraping HTML: ${source.name}`);
      
      const response = await axios.get(source.url, {
        timeout: this.timeout,
        headers: { 'User-Agent': this.userAgent }
      });

      const $ = cheerio.load(response.data);
      const threats = [];

      // Extract items using configured selectors
      $(source.selectors.title).each((index, element) => {
        if (index >= 10) return false; // Limit to 10 items

        const threat = this.extractThreatFromElement($, element, source);
        if (threat && threatFormatter.isRelevantThreat(threat)) {
          threats.push(threat);
        }
      });

      logger.info(`✅ HTML ${source.name}: Found ${threats.length} relevant threats`);
      return threats;

    } catch (error) {
      logger.error(`❌ HTML scraping failed for ${source.name}: ${error.message}`);
      return [];
    }
  }

  extractThreatFromElement($, titleElement, source) {
    try {
      const title = $(titleElement).text().trim();
      const link = $(titleElement).attr('href');
      
      // Find summary (try multiple approaches)
      let summary = '';
      const summaryElement = $(titleElement).closest('article, .item, .post, li')
        .find(source.selectors.summary).first();
      
      if (summaryElement.length) {
        summary = summaryElement.text().trim();
      } else {
        // Fallback: look for description near title
        summary = $(titleElement).parent().find('p, .description, .summary').first().text().trim();
      }

      // Extract date
      let date = new Date().toISOString();
      const dateElement = $(titleElement).closest('article, .item, .post, li')
        .find(source.selectors.date).first();
      
      if (dateElement.length) {
        const dateText = dateElement.text().trim();
        const parsedDate = new Date(dateText);
        if (!isNaN(parsedDate.getTime())) {
          date = parsedDate.toISOString();
        }
      }

      // Construct full URL if relative
      let fullUrl = link;
      if (link && !link.startsWith('http')) {
        const baseUrl = new URL(source.url);
        fullUrl = new URL(link, baseUrl.origin).href;
      }

      return threatFormatter.formatHTMLItem({
        title,
        summary: summary || title,
        url: fullUrl,
        date,
        source: source.name,
        category: source.category
      });

    } catch (error) {
      logger.error(`Error extracting threat from HTML element: ${error.message}`);
      return null;
    }
  }

  async scrapeAllSources(sources) {
    const allThreats = [];
    
    for (const sourceKey in sources) {
      const source = sources[sourceKey];
      const threats = await this.scrapeSource(source);
      allThreats.push(...threats);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return allThreats;
  }

  async forwardToDetect(threats) {
    const coreUrl = process.env.CORE_BACKEND_URL || 'http://localhost:5000';
    
    for (const threat of threats) {
      try {
        await axios.post(`${coreUrl}/api/detect/ingest`, threat, {
          timeout: 5000,
          headers: { 'Content-Type': 'application/json' }
        });
        logger.info(`📤 Forwarded HTML threat: ${threat.title}`);
      } catch (error) {
        logger.error(`❌ Failed to forward HTML threat: ${error.message}`);
      }
    }
  }
}

module.exports = new HTMLScraper();
