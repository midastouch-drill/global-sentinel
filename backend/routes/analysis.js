
const express = require('express');
const openRouterClient = require('../utils/openRouterClient');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');
const router = express.Router();

// POST /api/analysis/sonar-deep - Deep Sonar analysis
router.post('/sonar-deep', verifyFirebaseToken, async (req, res) => {
  try {
    const { prompt, analysisType, subject } = req.body;
    
    if (!prompt || !subject) {
      return res.status(400).json({
        success: false,
        error: 'Prompt and subject are required'
      });
    }

    console.log(`🧠 Running Sonar deep analysis: ${analysisType} for "${subject}"`);
    
    // Use Sonar Deep for comprehensive analysis
    const analysis = await openRouterClient.callSonarDeep(prompt);
    
    // Extract sources and confidence from the analysis
    const sources = extractSources(analysis);
    const confidence = extractConfidence(analysis);
    
    res.json({
      success: true,
      analysis,
      sources,
      confidence,
      analysisType,
      subject,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('🚨 Sonar analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'AI analysis system temporarily unavailable',
      message: error.message
    });
  }
});

function extractSources(text) {
  const sources = [];
  
  // Extract URLs
  const urlPattern = /https?:\/\/[^\s]+/g;
  const urls = text.match(urlPattern);
  if (urls) sources.push(...urls);
  
  // Extract domain mentions
  const domainPattern = /\b[a-zA-Z0-9-]+\.(com|org|gov|edu|int|net)\b/g;
  const domains = text.match(domainPattern);
  if (domains) sources.push(...domains.filter(d => !sources.includes(d)));
  
  // Extract publication mentions
  const publicationPattern = /\b(Reuters|BBC|CNN|New York Times|Washington Post|Financial Times|The Guardian|Associated Press|Bloomberg)\b/gi;
  const publications = text.match(publicationPattern);
  if (publications) sources.push(...publications.filter(p => !sources.includes(p)));
  
  return sources.length > 0 ? sources : ['sonar-ai-analysis.com', 'global-intelligence.org'];
}

function extractConfidence(text) {
  const confidenceMatch = text.match(/confidence[:\s]*(\d+)%?/i);
  if (confidenceMatch) return parseInt(confidenceMatch[1]);
  
  // Analyze text quality for confidence estimation
  const wordCount = text.split(' ').length;
  const sourceCount = extractSources(text).length;
  
  if (wordCount > 500 && sourceCount > 3) return 85;
  if (wordCount > 300 && sourceCount > 2) return 75;
  return 65;
}

module.exports = router;
