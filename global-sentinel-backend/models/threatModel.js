
class ThreatModel {
  static schema = {
    id: 'string',
    title: 'string',
    type: 'string', // Cyber, Health, Climate, Conflict, Economic, AI
    severity: 'number', // 0-100
    summary: 'string',
    regions: 'array', // Geographic regions affected
    sources: 'array', // Source URLs/references
    timestamp: 'string', // ISO timestamp
    status: 'string', // active, resolved, monitoring
    votes: {
      confirm: 'number',
      deny: 'number',
      skeptical: 'number'
    },
    credibilityScore: 'number', // 0-100 based on votes
    lastVoteTimestamp: 'string',
    verifications: 'array', // Related verification IDs
    simulations: 'array' // Related simulation IDs
  };

  static validate(threatData) {
    const required = ['title', 'type', 'severity', 'summary'];
    const missing = required.filter(field => !threatData[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    
    if (threatData.severity < 0 || threatData.severity > 100) {
      throw new Error('Severity must be between 0 and 100');
    }
    
    const validTypes = ['Cyber', 'Health', 'Climate', 'Conflict', 'Economic', 'AI'];
    if (!validTypes.includes(threatData.type)) {
      throw new Error(`Invalid type. Must be one of: ${validTypes.join(', ')}`);
    }
    
    return true;
  }

  static sanitize(threatData) {
    return {
      id: threatData.id || null,
      title: String(threatData.title).substring(0, 200),
      type: threatData.type,
      severity: Math.max(0, Math.min(100, Number(threatData.severity))),
      summary: String(threatData.summary).substring(0, 1000),
      regions: Array.isArray(threatData.regions) ? threatData.regions : [],
      sources: Array.isArray(threatData.sources) ? threatData.sources : [],
      timestamp: threatData.timestamp || new Date().toISOString(),
      status: threatData.status || 'active',
      votes: threatData.votes || { confirm: 0, deny: 0, skeptical: 0 },
      credibilityScore: threatData.credibilityScore || 50,
      lastVoteTimestamp: threatData.lastVoteTimestamp || null,
      verifications: Array.isArray(threatData.verifications) ? threatData.verifications : [],
      simulations: Array.isArray(threatData.simulations) ? threatData.simulations : []
    };
  }
}

module.exports = ThreatModel;
