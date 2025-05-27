
const express = require('express');
const router = express.Router();

// Test RSS scraping endpoint
router.post('/test-rss', async (req, res) => {
  try {
    console.log('🧪 RSS scraper test triggered from frontend');
    
    // Simulate RSS scraping
    const mockThreats = [
      {
        id: 'rss-test-1',
        title: 'RSS Test Threat - Geopolitical Tensions Rising',
        type: 'Geopolitical',
        severity: 75,
        summary: 'Test RSS feed parsing and threat detection',
        regions: ['Europe'],
        sources: ['test-rss-feed.com'],
        timestamp: new Date().toISOString(),
        status: 'active'
      }
    ];

    res.json({
      success: true,
      scraper: 'RSS',
      data: {
        count: mockThreats.length,
        threats: mockThreats
      },
      message: 'RSS scraper test completed'
    });
  } catch (error) {
    console.error('RSS test error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Test API scraping endpoint
router.post('/test-api', async (req, res) => {
  try {
    console.log('🧪 API scraper test triggered from frontend');
    
    const mockThreats = [
      {
        id: 'api-test-1',
        title: 'API Test Threat - Earthquake Detection',
        type: 'Natural Disaster',
        severity: 68,
        summary: 'Test API integration and data processing',
        regions: ['Pacific Ring of Fire'],
        sources: ['usgs.gov'],
        timestamp: new Date().toISOString(),
        status: 'active'
      }
    ];

    res.json({
      success: true,
      scraper: 'API',
      data: {
        count: mockThreats.length,
        threats: mockThreats
      },
      message: 'API scraper test completed'
    });
  } catch (error) {
    console.error('API test error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Test HTML scraping endpoint
router.post('/test-html', async (req, res) => {
  try {
    console.log('🧪 HTML scraper test triggered from frontend');
    
    const mockThreats = [
      {
        id: 'html-test-1',
        title: 'HTML Test Threat - Cyber Security Breach',
        type: 'Cyber',
        severity: 82,
        summary: 'Test HTML parsing and threat extraction',
        regions: ['Global'],
        sources: ['security-news.com'],
        timestamp: new Date().toISOString(),
        status: 'active'
      }
    ];

    res.json({
      success: true,
      scraper: 'HTML',
      data: {
        count: mockThreats.length,
        threats: mockThreats
      },
      message: 'HTML scraper test completed'
    });
  } catch (error) {
    console.error('HTML test error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Test Reddit scraping endpoint
router.post('/test-reddit', async (req, res) => {
  try {
    console.log('🧪 Reddit scraper test triggered from frontend');
    
    const mockThreats = [
      {
        id: 'reddit-test-1',
        title: 'Reddit Test Threat - Social Media Disinformation',
        type: 'Information Warfare',
        severity: 71,
        summary: 'Test Reddit API integration and content analysis',
        regions: ['North America', 'Europe'],
        sources: ['reddit.com/r/worldnews'],
        timestamp: new Date().toISOString(),
        status: 'active'
      }
    ];

    res.json({
      success: true,
      scraper: 'Reddit',
      data: {
        count: mockThreats.length,
        threats: mockThreats
      },
      message: 'Reddit scraper test completed'
    });
  } catch (error) {
    console.error('Reddit test error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
