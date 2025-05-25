
class ChaosIndexCalculator {
  static calculateThreatSeverity(threat) {
    let score = 0;
    
    // Base severity from AI analysis
    score += threat.severity || 0;
    
    // Geographic spread multiplier
    const regions = threat.regions?.length || 1;
    score += Math.min(regions * 5, 25);
    
    // Source credibility boost
    const credibleSources = threat.sources?.filter(source => 
      this.isCredibleSource(source)
    ).length || 0;
    score += credibleSources * 3;
    
    // Recency factor (more recent = higher impact)
    const hoursOld = (new Date() - new Date(threat.timestamp)) / (1000 * 60 * 60);
    const recencyMultiplier = Math.max(0.5, 1 - (hoursOld / 168)); // Decay over a week
    score *= recencyMultiplier;
    
    // Domain escalation factors
    const escalationFactors = {
      'Cyber': 1.2,
      'Health': 1.3,
      'Climate': 1.1,
      'Conflict': 1.4,
      'Economic': 1.1,
      'AI': 1.3
    };
    
    score *= escalationFactors[threat.type] || 1.0;
    
    return Math.min(Math.round(score), 100);
  }

  static calculateDomainChaosIndex(threats, domain) {
    const domainThreats = threats.filter(t => t.type === domain);
    
    if (domainThreats.length === 0) return 0;
    
    // Weighted average with higher weight for more severe threats
    let totalWeight = 0;
    let weightedSum = 0;
    
    domainThreats.forEach(threat => {
      const severity = this.calculateThreatSeverity(threat);
      const weight = Math.pow(severity / 100, 2); // Quadratic weighting
      weightedSum += severity * weight;
      totalWeight += weight;
    });
    
    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  }

  static calculateGlobalChaosIndex(threats) {
    const domains = ['Cyber', 'Health', 'Climate', 'Conflict', 'Economic', 'AI'];
    const domainWeights = {
      'Cyber': 0.2,
      'Health': 0.25,
      'Climate': 0.15,
      'Conflict': 0.25,
      'Economic': 0.1,
      'AI': 0.05
    };
    
    let globalIndex = 0;
    
    domains.forEach(domain => {
      const domainIndex = this.calculateDomainChaosIndex(threats, domain);
      globalIndex += domainIndex * domainWeights[domain];
    });
    
    // Apply convergence multiplier (threats reinforcing each other)
    const activeDomainsCount = domains.filter(domain => 
      this.calculateDomainChaosIndex(threats, domain) > 30
    ).length;
    
    if (activeDomainsCount > 2) {
      globalIndex *= (1 + (activeDomainsCount - 2) * 0.1); // 10% boost per additional active domain
    }
    
    return Math.min(Math.round(globalIndex), 100);
  }

  static generateTrendData(threatHistory, days = 30) {
    const trends = {
      labels: [],
      datasets: {
        Cyber: [],
        Health: [],
        Climate: [],
        Conflict: [],
        Economic: [],
        AI: [],
        Global: []
      }
    };
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const dayLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      trends.labels.push(dayLabel);
      
      // Filter threats for this day
      const dayThreats = threatHistory.filter(threat => {
        const threatDate = new Date(threat.timestamp);
        return threatDate.toDateString() === date.toDateString();
      });
      
      // Calculate indices for each domain
      Object.keys(trends.datasets).forEach(domain => {
        if (domain === 'Global') {
          trends.datasets[domain].push(this.calculateGlobalChaosIndex(dayThreats));
        } else {
          trends.datasets[domain].push(this.calculateDomainChaosIndex(dayThreats, domain));
        }
      });
    }
    
    return trends;
  }

  static isCredibleSource(source) {
    const credibleDomains = [
      'who.int', 'un.org', 'nato.int', 'cdc.gov', 'fbi.gov',
      'reuters.com', 'bbc.com', 'ft.com', 'economist.com',
      'nature.com', 'science.org', 'arxiv.org', 'pubmed.ncbi.nlm.nih.gov'
    ];
    
    return credibleDomains.some(domain => source.includes(domain));
  }
}

module.exports = ChaosIndexCalculator;
