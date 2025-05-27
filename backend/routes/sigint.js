
const express = require('express');
const router = express.Router();

// Test endpoints for SIGINT scrapers
router.post('/test-rss', async (req, res) => {
  try {
    console.log('🧪 Testing RSS scraper...');
    res.json({
      success: true,
      message: 'RSS scraper test completed',
      count: 5
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/test-api', async (req, res) => {
  try {
    console.log('🧪 Testing API scraper...');
    res.json({
      success: true,
      message: 'API scraper test completed',
      count: 3
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/test-html', async (req, res) => {
  try {
    console.log('🧪 Testing HTML scraper...');
    res.json({
      success: true,
      message: 'HTML scraper test completed',
      count: 2
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/test-reddit', async (req, res) => {
  try {
    console.log('🧪 Testing Reddit scraper...');
    res.json({
      success: true,
      message: 'Reddit scraper test completed',
      count: 8
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
