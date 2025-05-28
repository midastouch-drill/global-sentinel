
const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const axios = require('axios');

// Test RSS scraping and forward to core backend
router.post('/rss', async (req, res) => {
  try {
    console.log('🧪 Testing RSS scraper...');
    
    // Simulate scraped RSS data
    const mockThreats = [
      {
        title: 'Global Supply Chain Cyberattack Disrupts Critical Infrastructure',
        type: 'Cyber',
        severity: 87,
        summary: 'Major cyberattack targeting global supply chain management systems affecting ports and logistics worldwide.',
        regions: ['Global'],
        sources: ['https://reuters.com/technology'],
        location: 'Multiple Countries',
        tags: ['cyber', 'infrastructure', 'supply-chain'],
        signal_type: 'RSS_Feed'
      },
      {
        title: 'New Pandemic Variant Detected in Central Africa',
        type: 'Health',
        severity: 78,
        summary: 'Health authorities report new variant with increased transmission rates in Central African region.',
        regions: ['Central Africa'],
        sources: ['https://who.int/news'],
        location: 'Central Africa',
        tags: ['health', 'pandemic', 'variant'],
        signal_type: 'RSS_Feed'
      }
    ];

    // Forward each threat to core backend
    const coreUrl = process.env.CORE_BACKEND_URL || 'http://localhost:5000';
    const results = [];

    for (const threat of mockThreats) {
      try {
        console.log(`📤 Forwarding RSS threat: ${threat.title}`);
        
        const response = await axios.post(`${coreUrl}/api/detect/ingest`, threat, {
          timeout: 10000,
          headers: { 
            'Content-Type': 'application/json',
            'User-Agent': 'Global Sentinel SIGINT v1.0'
          }
        });
        
        if (response.data.success) {
          console.log(`✅ Successfully forwarded: ${threat.title}`);
          results.push({ threat: threat.title, status: 'success', id: response.data.threatId });
        } else {
          console.log(`❌ Failed to forward: ${threat.title}`);
          results.push({ threat: threat.title, status: 'failed', error: response.data.error });
        }
      } catch (forwardError) {
        console.error(`❌ Forward error for ${threat.title}:`, forwardError.message);
        results.push({ threat: threat.title, status: 'error', error: forwardError.message });
      }
    }

    res.json({
      success: true,
      message: 'RSS scraper test completed',
      threatsFound: mockThreats.length,
      forwardResults: results,
      count: mockThreats.length
    });
  } catch (error) {
    console.error('❌ RSS scraper test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test API scraping and forward to core backend
router.post('/api', async (req, res) => {
  try {
    console.log('🧪 Testing API scraper...');
    
    const mockThreats = [
      {
        title: 'Severe Climate Event Triggers Mass Migration',
        type: 'Climate',
        severity: 82,
        summary: 'Unprecedented weather patterns forcing large-scale population movements across South Asia.',
        regions: ['South Asia'],
        sources: ['https://gdelt-api.org'],
        location: 'South Asia',
        tags: ['climate', 'migration', 'weather'],
        signal_type: 'API_Source'
      }
    ];

    const coreUrl = process.env.CORE_BACKEND_URL || 'http://localhost:5000';
    const results = [];

    for (const threat of mockThreats) {
      try {
        console.log(`📤 Forwarding API threat: ${threat.title}`);
        
        const response = await axios.post(`${coreUrl}/api/detect/ingest`, threat, {
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' }
        });
        
        results.push({ 
          threat: threat.title, 
          status: response.data.success ? 'success' : 'failed',
          id: response.data.threatId 
        });
      } catch (forwardError) {
        console.error(`❌ Forward error:`, forwardError.message);
        results.push({ threat: threat.title, status: 'error', error: forwardError.message });
      }
    }

    res.json({
      success: true,
      message: 'API scraper test completed',
      threatsFound: mockThreats.length,
      forwardResults: results,
      count: mockThreats.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test HTML scraping and forward to core backend
router.post('/html', async (req, res) => {
  try {
    console.log('🧪 Testing HTML scraper...');
    
    const mockThreats = [
      {
        title: 'Government Agency Reports Critical Security Breach',
        type: 'Cyber',
        severity: 89,
        summary: 'Major security incident affecting government systems with potential data exposure.',
        regions: ['North America'],
        sources: ['https://cisa.gov/alerts'],
        location: 'United States',
        tags: ['cyber', 'government', 'breach'],
        signal_type: 'HTML_Scrape'
      }
    ];

    const coreUrl = process.env.CORE_BACKEND_URL || 'http://localhost:5000';
    const results = [];

    for (const threat of mockThreats) {
      try {
        const response = await axios.post(`${coreUrl}/api/detect/ingest`, threat, {
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' }
        });
        
        results.push({ 
          threat: threat.title, 
          status: response.data.success ? 'success' : 'failed',
          id: response.data.threatId 
        });
      } catch (forwardError) {
        results.push({ threat: threat.title, status: 'error', error: forwardError.message });
      }
    }

    res.json({
      success: true,
      message: 'HTML scraper test completed',
      threatsFound: mockThreats.length,
      forwardResults: results,
      count: mockThreats.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test Reddit scraping and forward to core backend
router.post('/reddit', async (req, res) => {
  try {
    console.log('🧪 Testing Reddit scraper...');
    
    const mockThreats = [
      {
        title: 'Social Media Analysis Reveals Growing Economic Instability',
        type: 'Economic',
        severity: 75,
        summary: 'Reddit discussion patterns indicate rising concerns about economic stability and potential market volatility.',
        regions: ['Global'],
        sources: ['https://reddit.com/r/economics'],
        location: 'Global',
        tags: ['economic', 'social-media', 'market'],
        signal_type: 'Reddit_Analysis'
      },
      {
        title: 'Cybersecurity Community Reports Zero-Day Exploit',
        type: 'Cyber',
        severity: 84,
        summary: 'Active discussion in cybersecurity forums about newly discovered vulnerability affecting critical systems.',
        regions: ['Global'],
        sources: ['https://reddit.com/r/cybersecurity'],
        location: 'Global',
        tags: ['cyber', 'zero-day', 'vulnerability'],
        signal_type: 'Reddit_Analysis'
      }
    ];

    const coreUrl = process.env.CORE_BACKEND_URL || 'http://localhost:5000';
    const results = [];

    for (const threat of mockThreats) {
      try {
        const response = await axios.post(`${coreUrl}/api/detect/ingest`, threat, {
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' }
        });
        
        results.push({ 
          threat: threat.title, 
          status: response.data.success ? 'success' : 'failed',
          id: response.data.threatId 
        });
      } catch (forwardError) {
        results.push({ threat: threat.title, status: 'error', error: forwardError.message });
      }
    }

    res.json({
      success: true,
      message: 'Reddit scraper test completed',
      threatsFound: mockThreats.length,
      forwardResults: results,
      count: mockThreats.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
