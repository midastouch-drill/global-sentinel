
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

  async forwardToDetect(threats) {
    const coreUrl = process.env.CORE_BACKEND_URL || 'http://localhost:5000';
    
    for (const threat of threats) {
      try {
        await axios.post(`${coreUrl}/api/detect/ingest`, threat, {
          timeout: 5000,
          headers: { 'Content-Type': 'application/json' }
        });
        logger.info(`📤 Forwarded Reddit threat: ${threat.title}`);
      } catch (error) {
        logger.error(`❌ Failed to forward Reddit threat: ${error.message}`);
      }
    }
  }
}

module.exports = new RedditScraper();
