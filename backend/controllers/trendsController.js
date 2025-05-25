
const { getFirestore } = require('../config/firebase');
const ChaosIndexCalculator = require('../utils/chaosIndexCalculator');
const SonarPromptBuilder = require('../utils/sonarPromptBuilder');
const openRouterClient = require('../utils/openRouterClient');

class TrendsController {
  static async getTrends(req, res) {
    try {
      const { timeframe = '30', domains } = req.query;
      const days = parseInt(timeframe);
      
      console.log(`📈 Generating trends analysis for ${days} days`);
      
      const db = getFirestore();
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      // Fetch threats within timeframe
      const threatsSnapshot = await db.collection('threats')
        .where('timestamp', '>=', startDate.toISOString())
        .where('timestamp', '<=', endDate.toISOString())
        .orderBy('timestamp', 'asc')
        .get();
      
      const threats = [];
      threatsSnapshot.forEach(doc => {
        threats.push({ id: doc.id, ...doc.data() });
      });
      
      // Generate trend data
      const trendData = ChaosIndexCalculator.generateTrendData(threats, days);
      
      // Calculate domain statistics
      const domainStats = TrendsController.calculateDomainStats(threats);
      
      // Get geographic distribution
      const geographicData = TrendsController.getGeographicDistribution(threats);
      
      // Calculate current vs previous period comparison
      const comparison = await TrendsController.calculatePeriodComparison(threats, days);
      
      res.json({
        success: true,
        timeframe: `${days} days`,
        trends: trendData,
        domainStats,
        geographicData,
        comparison,
        totalThreats: threats.length,
        lastUpdated: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('🚨 Trends analysis error:', error);
      res.status(500).json({
        success: false,
        error: 'Trends analysis system failure',
        message: error.message
      });
    }
  }

  static calculateDomainStats(threats) {
    const domains = ['Cyber', 'Health', 'Climate', 'Conflict', 'Economic', 'AI'];
    const stats = {};
    
    domains.forEach(domain => {
      const domainThreats = threats.filter(t => t.type === domain);
      
      stats[domain] = {
        count: domainThreats.length,
        averageSeverity: domainThreats.length > 0 
          ? Math.round(domainThreats.reduce((sum, t) => sum + (t.severity || 0), 0) / domainThreats.length)
          : 0,
        maxSeverity: domainThreats.length > 0 
          ? Math.max(...domainThreats.map(t => t.severity || 0))
          : 0,
        activeThreats: domainThreats.filter(t => t.status === 'active').length,
        chaosIndex: ChaosIndexCalculator.calculateDomainChaosIndex(threats, domain)
      };
    });
    
    return stats;
  }

  static getGeographicDistribution(threats) {
    const regionCounts = {};
    const regionSeverity = {};
    
    threats.forEach(threat => {
      const regions = threat.regions || ['Unknown'];
      regions.forEach(region => {
        regionCounts[region] = (regionCounts[region] || 0) + 1;
        regionSeverity[region] = (regionSeverity[region] || []).concat(threat.severity || 0);
      });
    });
    
    // Calculate average severity per region
    const regionData = Object.keys(regionCounts).map(region => ({
      region,
      threatCount: regionCounts[region],
      averageSeverity: regionSeverity[region].length > 0
        ? Math.round(regionSeverity[region].reduce((a, b) => a + b, 0) / regionSeverity[region].length)
        : 0,
      maxSeverity: regionSeverity[region].length > 0
        ? Math.max(...regionSeverity[region])
        : 0
    }));
    
    return regionData.sort((a, b) => b.threatCount - a.threatCount);
  }

  static async calculatePeriodComparison(currentThreats, days) {
    try {
      const db = getFirestore();
      
      // Get previous period data
      const prevEndDate = new Date();
      prevEndDate.setDate(prevEndDate.getDate() - days);
      const prevStartDate = new Date();
      prevStartDate.setDate(prevStartDate.getDate() - (days * 2));
      
      const prevThreatsSnapshot = await db.collection('threats')
        .where('timestamp', '>=', prevStartDate.toISOString())
        .where('timestamp', '<', prevEndDate.toISOString())
        .get();
      
      const prevThreats = [];
      prevThreatsSnapshot.forEach(doc => {
        prevThreats.push({ id: doc.id, ...doc.data() });
      });
      
      // Calculate changes
      const currentChaos = ChaosIndexCalculator.calculateGlobalChaosIndex(currentThreats);
      const prevChaos = ChaosIndexCalculator.calculateGlobalChaosIndex(prevThreats);
      
      const comparison = {
        chaosIndexChange: currentChaos - prevChaos,
        threatCountChange: currentThreats.length - prevThreats.length,
        averageSeverityChange: TrendsController.calculateAverageSeverityChange(currentThreats, prevThreats),
        trend: currentChaos > prevChaos ? 'increasing' : currentChaos < prevChaos ? 'decreasing' : 'stable'
      };
      
      return comparison;
      
    } catch (error) {
      console.warn('⚠️ Period comparison calculation failed:', error.message);
      return {
        chaosIndexChange: 0,
        threatCountChange: 0,
        averageSeverityChange: 0,
        trend: 'unknown'
      };
    }
  }

  static calculateAverageSeverityChange(currentThreats, prevThreats) {
    const currentAvg = currentThreats.length > 0 
      ? currentThreats.reduce((sum, t) => sum + (t.severity || 0), 0) / currentThreats.length
      : 0;
    
    const prevAvg = prevThreats.length > 0 
      ? prevThreats.reduce((sum, t) => sum + (t.severity || 0), 0) / prevThreats.length
      : 0;
    
    return Math.round((currentAvg - prevAvg) * 10) / 10; // Round to 1 decimal
  }

  static async getForecast(req, res) {
    try {
      const { horizon = '7' } = req.query;
      const days = parseInt(horizon);
      
      console.log(`🔮 Generating threat forecast for next ${days} days`);
      
      const db = getFirestore();
      
      // Get recent threat data
      const recentSnapshot = await db.collection('threats')
        .orderBy('timestamp', 'desc')
        .limit(50)
        .get();
      
      const recentThreats = [];
      recentSnapshot.forEach(doc => {
        recentThreats.push({ id: doc.id, ...doc.data() });
      });
      
      // Generate AI-powered trend analysis
      const trendPrompt = SonarPromptBuilder.buildTrendAnalysisPrompt(`${days} days`);
      const analysis = await openRouterClient.callSonarReasoning(trendPrompt);
      
      // Parse forecast
      const forecast = TrendsController.parseForecast(analysis, recentThreats, days);
      
      res.json({
        success: true,
        forecast,
        horizon: `${days} days`,
        basedOn: `${recentThreats.length} recent threats`,
        generatedAt: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('🚨 Forecast generation error:', error);
      res.status(500).json({
        success: false,
        error: 'Forecast system failure',
        message: error.message
      });
    }
  }

  static parseForecast(analysis, recentThreats, days) {
    // Extract forecast data from AI analysis
    const currentChaos = ChaosIndexCalculator.calculateGlobalChaosIndex(recentThreats);
    
    // Generate probabilistic forecast
    const forecast = {
      currentChaosIndex: currentChaos,
      projectedChange: TrendsController.calculateProjectedChange(recentThreats),
      riskFactors: TrendsController.extractRiskFactors(analysis),
      emergingThreats: TrendsController.extractEmergingThreats(analysis),
      confidence: TrendsController.calculateForecastConfidence(recentThreats),
      recommendations: TrendsController.extractRecommendations(analysis)
    };
    
    return forecast;
  }

  static calculateProjectedChange(recentThreats) {
    // Simple trend projection based on recent data
    const severities = recentThreats.map(t => t.severity || 0);
    if (severities.length < 2) return 0;
    
    // Calculate linear trend
    const recent = severities.slice(0, 10);
    const older = severities.slice(10, 20);
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : recentAvg;
    
    return Math.round((recentAvg - olderAvg) * 10) / 10;
  }

  static extractRiskFactors(analysis) {
    // Extract risk factors from AI analysis
    const factors = [];
    const lines = analysis.split('\n');
    
    lines.forEach(line => {
      if (line.toLowerCase().includes('risk') || line.toLowerCase().includes('factor')) {
        factors.push(line.trim());
      }
    });
    
    return factors.slice(0, 5);
  }

  static extractEmergingThreats(analysis) {
    const threats = [];
    const lines = analysis.split('\n');
    
    lines.forEach(line => {
      if (line.toLowerCase().includes('emerging') || line.toLowerCase().includes('new')) {
        threats.push(line.trim());
      }
    });
    
    return threats.slice(0, 3);
  }

  static extractRecommendations(analysis) {
    const recommendations = [];
    const lines = analysis.split('\n');
    
    lines.forEach(line => {
      if (line.toLowerCase().includes('recommend') || line.toLowerCase().includes('should')) {
        recommendations.push(line.trim());
      }
    });
    
    return recommendations.slice(0, 5);
  }

  static calculateForecastConfidence(recentThreats) {
    // Base confidence on data quality and quantity
    let confidence = 50;
    
    if (recentThreats.length > 20) confidence += 20;
    if (recentThreats.length > 50) confidence += 10;
    
    // Check data recency
    const recentCount = recentThreats.filter(t => {
      const threatDate = new Date(t.timestamp);
      const daysDiff = (new Date() - threatDate) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    }).length;
    
    if (recentCount > 10) confidence += 15;
    
    return Math.min(confidence, 85); // Cap at 85%
  }
}

module.exports = TrendsController;
