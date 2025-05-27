
const axios = require('axios');
const logger = require('../utils/logger');
const threatFormatter = require('../utils/threatFormatter');

class RedditScraper {
  constructor() {
    this.baseUrl = 'https://www.reddit.com/r';
    this.userAgent = 'Global Sentinel SIGINT Bot v1.0';
    this.subreddits = [
      'worldnews',
      'news', 
      'geopolitics',
      'cybersecurity',
      'climate',
      'economics',
      'pandemic'
    ];
  }

  async scrapeSubreddit(subreddit) {
    try {
      logger.info(`🔍 Scraping Reddit: r/${subreddit}`);
      
      const response = await axios.get(`${this.baseUrl}/${subreddit}/hot.json`, {
        params: { limit: 25 },
        headers: { 'User-Agent': this.userAgent },
        timeout: 10000
      });

      const threats = [];
      const posts = response.data.data.children || [];

      for (const post of posts) {
        const threat = threatFormatter.formatRedditPost(post.data, subreddit);
        if (threat && threatFormatter.isRelevantThreat(threat)) {
          threats.push(threat);
        }
      }

      logger.info(`✅ Reddit r/${subreddit}: Found ${threats.length} relevant threats`);
      return threats;

    } catch (error) {
      logger.error(`❌ Reddit scraping failed for r/${subreddit}: ${error.message}`);
      return [];
    }
  }

  async scrapeAllSubreddits() {
    const allThreats = [];
    
    for (const subreddit of this.subreddits) {
      const threats = await this.scrapeSubreddit(subreddit);
      allThreats.push(...threats);
      
      // Rate limiting for Reddit API
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return allThreats;
  }

  async forwardToDetectWithRetry(threat, maxRetries = 3) {
    const coreUrl = process.env.CORE_BACKEND_URL || 'http://localhost:5000';
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`📤 Attempting to forward Reddit threat: ${threat.title} (attempt ${attempt})`);
        
        const response = await axios.post(`${coreUrl}/api/detect/ingest`, threat, {
          timeout: 10000,
          headers: { 
            'Content-Type': 'application/json',
            'User-Agent': 'Global Sentinel SIGINT v1.0'
          }
        });
        
        if (response.data.success) {
          logger.info(`✅ Successfully forwarded Reddit threat: ${threat.title}`);
          return { success: true, threatId: response.data.threatId };
        } else {
          logger.error(`❌ Backend rejected threat: ${response.data.error}`);
          return { success: false, error: response.data.error };
        }
        
      } catch (error) {
        const errorMsg = error.response?.data?.error || error.message || 'Unknown error';
        const statusCode = error.response?.status || 'No status';
        
        logger.error(`❌ Failed to forward Reddit threat (attempt ${attempt}/${maxRetries}): ${threat.title}`);
        logger.error(`   Error: ${errorMsg}`);
        logger.error(`   Status: ${statusCode}`);
        logger.error(`   URL: ${coreUrl}/api/detect/ingest`);
        
        if (error.code === 'ECONNREFUSED') {
          logger.error(`   Connection refused - Core backend not running on ${coreUrl}`);
        }
        
        if (attempt === maxRetries) {
          return { success: false, error: errorMsg };
        }
        
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        logger.info(`   Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async forwardToDetect(threats) {
    if (!Array.isArray(threats)) {
      threats = [threats];
    }

    logger.info(`📤 Starting Reddit threat forwarding: ${threats.length} threats`);
    
    const results = [];
    let successful = 0;
    let failed = 0;
    
    for (const threat of threats) {
      const result = await this.forwardToDetectWithRetry(threat);
      results.push(result);
      
      if (result.success) {
        successful++;
      } else {
        failed++;
        logger.error(`❌ Failed to forward Reddit threat: ${threat.title} - ${result.error}`);
      }
      
      // Rate limiting between requests
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    logger.info(`📊 Reddit forward complete: ${successful} success, ${failed} failed`);
    return results;
  }
}

module.exports = new RedditScraper();
