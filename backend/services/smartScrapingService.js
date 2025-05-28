const { getFirestore } = require('../config/firebase');
const logger = require('../utils/logger');
const axios = require('axios');

// Import scrapers
const rssScraper = require('../scrapers/rssScraper');
const apiScraper = require('../scrapers/apiScraper');
const htmlScraper = require('../scrapers/htmlScraper');

// Import source configs
const rssSources = require('../config/rssSources');
const apiSources = require('../config/apiSources');
const htmlSources = require('../config/htmlSources');

class SmartScrapingService {
  constructor() {
    this.maxThreats = 30;
    this.lastScrapeTime = null;
    this.isRunning = false;
    this.coreBackendUrl = process.env.CORE_BACKEND_URL || 'http://localhost:5000';
  }

  async runIntelligentScrape() {
    if (this.isRunning) {
      logger.warn('🔄 Smart scrape already in progress, skipping...');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();
    logger.info('🚀 Starting intelligent scraping cycle');

    try {
      // Collect threats from all sources
      const allThreats = [];
      
      // RSS Sources
      logger.info('📡 Processing RSS sources...');
      const rssThreats = await rssScraper.scrapeAllSources(rssSources);
      allThreats.push(...this.formatThreats(rssThreats, 'RSS'));

      // API Sources  
      logger.info('🔌 Processing API sources...');
      const apiThreats = await apiScraper.scrapeAllSources(apiSources);
      allThreats.push(...this.formatThreats(apiThreats, 'API'));

      // HTML Sources
      logger.info('🕸️ Processing HTML sources...');
      const htmlThreats = await htmlScraper.scrapeAllSources(htmlSources);
      allThreats.push(...this.formatThreats(htmlThreats, 'HTML'));

      // Smart filtering and rotation
      const selectedThreats = this.selectBestThreats(allThreats);
      
      // Forward threats to core backend AND store in Firestore
      await this.forwardThreatsToCore(selectedThreats);
      await this.overwriteFirestoreThreats(selectedThreats);

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      logger.info(`✅ Smart scrape completed: ${selectedThreats.length} threats processed in ${duration}s`);
      this.lastScrapeTime = new Date().toISOString();

    } catch (error) {
      logger.error(`❌ Smart scrape failed: ${error.message}`);
    } finally {
      this.isRunning = false;
    }
  }

  async forwardThreatsToCore(threats) {
    try {
      logger.info(`📤 Forwarding ${threats.length} threats to core backend...`);
      
      const forwardResults = [];
      
      for (const threat of threats) {
        try {
          const response = await axios.post(`${this.coreBackendUrl}/api/detect/ingest`, threat, {
            timeout: 10000,
            headers: { 
              'Content-Type': 'application/json',
              'User-Agent': 'Global Sentinel SIGINT v1.0'
            }
          });
          
          if (response.data.success) {
            forwardResults.push({ threat: threat.title, status: 'success', id: response.data.threatId });
            logger.info(`✅ Forwarded: ${threat.title}`);
          } else {
            forwardResults.push({ threat: threat.title, status: 'failed', error: response.data.error });
            logger.warn(`❌ Failed to forward: ${threat.title}`);
          }
        } catch (forwardError) {
          logger.error(`❌ Forward error for ${threat.title}: ${forwardError.message}`);
          forwardResults.push({ threat: threat.title, status: 'error', error: forwardError.message });
        }
      }
      
      const successCount = forwardResults.filter(r => r.status === 'success').length;
      logger.info(`📤 Forwarding complete: ${successCount}/${threats.length} threats successfully sent to core backend`);
      
    } catch (error) {
      logger.error(`❌ Threat forwarding failed: ${error.message}`);
    }
  }

  formatThreats(rawThreats, sourceType) {
    return rawThreats.map(threat => ({
      title: threat.title || 'Unknown Threat',
      type: this.mapToValidType(threat.type || sourceType),
      summary: threat.summary || threat.description || 'No summary available',
      severity: threat.severity || this.calculateSeverity(threat),
      sources: threat.sources || [threat.url || `${sourceType}-intelligence`],
      source_url: threat.url || threat.source || `${sourceType}-intelligence`,
      timestamp: new Date().toISOString(),
      location: this.extractLocation(threat.summary || ''),
      tags: this.extractTags(threat),
      signal_type: threat.type || sourceType,
      confidence: Math.floor(Math.random() * 30) + 70,
      regions: threat.regions || [this.inferRegion(threat.summary || '')]
    }));
  }

  mapToValidType(type) {
    const typeMapping = {
      'RSS': 'General',
      'API': 'Intelligence',
      'HTML': 'News',
      'cyber': 'Cyber',
      'health': 'Health',
      'climate': 'Climate',
      'economic': 'Economic',
      'conflict': 'Conflict'
    };
    
    return typeMapping[type] || 'General';
  }

  selectBestThreats(allThreats) {
    // Sort by severity and recency
    const sortedThreats = allThreats
      .filter(threat => threat.title && threat.summary)
      .sort((a, b) => {
        const severityDiff = (b.severity || 50) - (a.severity || 50);
        if (severityDiff !== 0) return severityDiff;
        return new Date(b.timestamp) - new Date(a.timestamp);
      });

    // Select top 30 threats
    return sortedThreats.slice(0, this.maxThreats);
  }

  async overwriteFirestoreThreats(threats) {
    try {
      const db = getFirestore();
      const batch = db.batch();

      // Overwrite fixed threat slots
      for (let i = 0; i < this.maxThreats; i++) {
        const threatId = `threat_${String(i + 1).padStart(3, '0')}`;
        const threatRef = db.collection('threats').doc(threatId);
        
        if (i < threats.length) {
          // Use fresh threat data
          batch.set(threatRef, {
            id: threatId,
            ...threats[i],
            status: 'active',
            votes: { credible: 0, not_credible: 0 },
            updatedAt: new Date().toISOString()
          });
        } else {
          // Clear unused slots
          batch.delete(threatRef);
        }
      }

      await batch.commit();
      logger.info(`✅ Overwrote ${threats.length} threat slots in Firestore`);
      
    } catch (error) {
      logger.error(`❌ Firestore overwrite failed: ${error.message}`);
      throw error;
    }
  }

  extractLocation(text) {
    const locationPatterns = [
      /\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g, // "New York", "Los Angeles"
      /\b([A-Z][a-z]+)\b/g // Single cities/countries
    ];

    for (const pattern of locationPatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        return matches[0];
      }
    }
    
    return 'Global';
  }

  extractTags(threat) {
    const tags = [];
    const text = (threat.title + ' ' + threat.summary).toLowerCase();
    
    const tagPatterns = {
      'cyber': ['cyber', 'hack', 'malware', 'breach', 'ransomware'],
      'climate': ['climate', 'drought', 'flood', 'hurricane', 'wildfire'],
      'conflict': ['war', 'conflict', 'military', 'tension', 'dispute'],
      'health': ['health', 'disease', 'pandemic', 'outbreak', 'virus'],
      'economic': ['economic', 'market', 'financial', 'trade', 'currency']
    };

    Object.entries(tagPatterns).forEach(([tag, keywords]) => {
      if (keywords.some(keyword => text.includes(keyword))) {
        tags.push(tag);
      }
    });

    return tags.length > 0 ? tags : ['intelligence'];
  }

  calculateSeverity(threat) {
    const text = (threat.title + ' ' + threat.summary).toLowerCase();
    let severity = 50; // Base severity

    const severityKeywords = {
      'critical': 25,
      'urgent': 20,
      'major': 15,
      'significant': 10,
      'minor': -10,
      'low': -15
    };

    Object.entries(severityKeywords).forEach(([keyword, modifier]) => {
      if (text.includes(keyword)) {
        severity += modifier;
      }
    });

    return Math.max(20, Math.min(95, severity));
  }

  inferRegion(text) {
    const regionPatterns = {
      'North America': ['usa', 'united states', 'canada', 'mexico', 'america'],
      'Europe': ['europe', 'eu', 'germany', 'france', 'uk', 'britain'],
      'Asia': ['china', 'japan', 'india', 'asia', 'korea', 'singapore'],
      'Middle East': ['israel', 'iran', 'saudi', 'dubai', 'turkey'],
      'Africa': ['africa', 'nigeria', 'south africa', 'egypt'],
      'South America': ['brazil', 'argentina', 'chile', 'colombia']
    };

    const lowerText = text.toLowerCase();
    
    for (const [region, keywords] of Object.entries(regionPatterns)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return region;
      }
    }
    
    return 'Global';
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      lastScrapeTime: this.lastScrapeTime,
      maxThreats: this.maxThreats
    };
  }
}

module.exports = new SmartScrapingService();
