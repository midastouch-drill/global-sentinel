
class ThreatFormatter {
  // Keywords for threat detection and severity scoring
  constructor() {
    this.threatKeywords = {
      critical: ['pandemic', 'outbreak', 'nuclear', 'terrorist', 'collapse', 'war', 'invasion', 'cyber attack', 'ransomware'],
      high: ['crisis', 'emergency', 'disaster', 'conflict', 'threat', 'breach', 'hack', 'shortage', 'inflation'],
      medium: ['risk', 'concern', 'warning', 'alert', 'unstable', 'tension', 'protest', 'strike'],
      low: ['monitoring', 'watch', 'developing', 'potential', 'possible']
    };

    this.categoryKeywords = {
      Health: ['health', 'disease', 'virus', 'pandemic', 'outbreak', 'medical', 'who', 'cdc'],
      Cyber: ['cyber', 'hack', 'breach', 'ransomware', 'malware', 'security', 'data leak'],
      Climate: ['climate', 'weather', 'hurricane', 'flood', 'drought', 'temperature', 'wildfire'],
      Economic: ['economy', 'market', 'inflation', 'recession', 'gdp', 'financial', 'trade'],
      Conflict: ['war', 'conflict', 'military', 'weapons', 'terrorism', 'violence', 'protest'],
      Natural: ['earthquake', 'tsunami', 'volcano', 'natural disaster', 'geological']
    };
  }

  formatRSSItem(item, source) {
    const content = `${item.title} ${item.description || ''} ${item.summary || ''}`.toLowerCase();
    
    return {
      title: this.cleanTitle(item.title),
      summary: this.extractSummary(item.description || item.summary || item.title),
      type: this.detectCategory(content, source.category),
      severity: this.calculateSeverity(content),
      source: source.name,
      url: item.link || item.guid,
      timestamp: this.parseDate(item.pubDate || item.isoDate).toISOString(),
      rawData: {
        scraper: 'rss',
        feedUrl: source.url
      }
    };
  }

  formatGDELTArticle(article, config) {
    const content = `${article.title} ${article.seendate}`.toLowerCase();
    
    return {
      title: this.cleanTitle(article.title),
      summary: this.extractSummary(article.title),
      type: this.detectCategory(content, config.category),
      severity: this.calculateSeverity(content),
      source: article.domain || config.name,
      url: article.url,
      timestamp: new Date(article.seendate).toISOString(),
      rawData: {
        scraper: 'gdelt',
        tone: article.tone,
        socialsharecount: article.socialsharecount
      }
    };
  }

  formatUSGSEarthquake(earthquake, config) {
    const props = earthquake.properties;
    const coords = earthquake.geometry.coordinates;
    
    return {
      title: `Magnitude ${props.mag} Earthquake - ${props.place}`,
      summary: `${props.mag} magnitude earthquake occurred ${props.place}. Depth: ${coords[2]}km`,
      type: 'Natural',
      severity: this.calculateEarthquakeSeverity(props.mag),
      source: config.name,
      url: props.url,
      timestamp: new Date(props.time).toISOString(),
      location: {
        latitude: coords[1],
        longitude: coords[0],
        depth: coords[2]
      },
      rawData: {
        scraper: 'usgs',
        magnitude: props.mag,
        depth: coords[2],
        felt: props.felt
      }
    };
  }

  formatHTMLItem(item) {
    const content = `${item.title} ${item.summary}`.toLowerCase();
    
    return {
      title: this.cleanTitle(item.title),
      summary: this.extractSummary(item.summary),
      type: this.detectCategory(content, item.category),
      severity: this.calculateSeverity(content),
      source: item.source,
      url: item.url,
      timestamp: item.date,
      rawData: {
        scraper: 'html'
      }
    };
  }

  formatRedditPost(post, subreddit) {
    const content = `${post.title} ${post.selftext || ''}`.toLowerCase();
    
    return {
      title: this.cleanTitle(post.title),
      summary: this.extractSummary(post.selftext || post.title),
      type: this.detectCategory(content, this.mapSubredditToCategory(subreddit)),
      severity: this.calculateRedditSeverity(content, post.score, post.num_comments),
      source: `Reddit r/${subreddit}`,
      url: `https://reddit.com${post.permalink}`,
      timestamp: new Date(post.created_utc * 1000).toISOString(),
      rawData: {
        scraper: 'reddit',
        score: post.score,
        comments: post.num_comments,
        subreddit: subreddit
      }
    };
  }

  cleanTitle(title) {
    if (!title) return 'Untitled';
    return title.replace(/\s+/g, ' ').trim().substring(0, 200);
  }

  extractSummary(text) {
    if (!text) return '';
    // Remove HTML tags and clean up
    const clean = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    return clean.substring(0, 500);
  }

  detectCategory(content, fallback = 'General') {
    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        return category;
      }
    }
    return fallback;
  }

  calculateSeverity(content) {
    let severity = 20; // Base severity
    
    for (const [level, keywords] of Object.entries(this.threatKeywords)) {
      const matches = keywords.filter(keyword => content.includes(keyword)).length;
      
      switch (level) {
        case 'critical': severity += matches * 25; break;
        case 'high': severity += matches * 15; break;
        case 'medium': severity += matches * 10; break;
        case 'low': severity += matches * 5; break;
      }
    }
    
    return Math.min(severity, 100);
  }

  calculateEarthquakeSeverity(magnitude) {
    if (magnitude >= 7.0) return 90;
    if (magnitude >= 6.0) return 75;
    if (magnitude >= 5.0) return 60;
    if (magnitude >= 4.0) return 45;
    return 30;
  }

  calculateRedditSeverity(content, score, comments) {
    let severity = this.calculateSeverity(content);
    
    // Boost based on engagement
    if (score > 1000) severity += 10;
    if (comments > 100) severity += 5;
    
    return Math.min(severity, 100);
  }

  mapSubredditToCategory(subreddit) {
    const mapping = {
      'worldnews': 'General',
      'news': 'General', 
      'geopolitics': 'Conflict',
      'cybersecurity': 'Cyber',
      'climate': 'Climate',
      'economics': 'Economic',
      'pandemic': 'Health'
    };
    return mapping[subreddit] || 'General';
  }

  parseDate(dateString) {
    if (!dateString) return new Date();
    const parsed = new Date(dateString);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  isRelevantThreat(threat) {
    // Filter out low-quality or irrelevant threats
    if (!threat.title || threat.title.length < 10) return false;
    if (threat.severity < 25) return false;
    
    // Filter out sports, entertainment, etc.
    const irrelevantKeywords = ['sports', 'celebrity', 'entertainment', 'music', 'movie', 'game', 'fashion'];
    const content = threat.title.toLowerCase();
    
    return !irrelevantKeywords.some(keyword => content.includes(keyword));
  }
}

module.exports = new ThreatFormatter();
