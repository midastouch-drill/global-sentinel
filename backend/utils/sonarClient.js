
const axios = require('axios');

class SonarClient {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.baseURL = 'https://openrouter.ai/api/v1/chat/completions';
    
    if (!this.apiKey) {
      throw new Error('OPENROUTER_API_KEY not found in environment variables');
    }
  }

  async sonarReasoning(hypothesis, useCounter = false) {
    try {
      const systemPrompt = useCounter 
        ? 'You are a critical analyst. Challenge the given hypothesis with counter-evidence and alternative explanations. Provide logical counter-arguments and contradictory evidence.'
        : 'You are a crisis reasoning specialist. Analyze the hypothesis and provide logical reasoning chains, causal relationships, and evidence-based implications.';

      const userPrompt = `${hypothesis}

Please provide:
1. REASONING CHAIN: Step-by-step logical progression
2. EVIDENCE ASSESSMENT: Supporting or contradicting evidence
3. CONFIDENCE LEVEL: Percentage confidence in the analysis
4. KEY FACTORS: Primary drivers and variables
5. IMPLICATIONS: Potential consequences and outcomes`;

      const response = await axios.post(this.baseURL, {
        model: 'perplexity/sonar-reasoning',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2500,
        top_p: 0.9
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://global-sentinel.ai',
          'X-Title': 'Global Sentinel Crisis Reasoning'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('🚨 Sonar Reasoning Error:', error.response?.status, error.response?.data || error.message);
      throw new Error(`Sonar reasoning failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async sonarDeepSearch(query, domains = [], citations = true) {
    try {
      const searchPrompt = `${query}

Focus search on recent developments and credible sources. Include:
1. CURRENT SIGNALS: Recent events and indicators
2. HISTORICAL PRECEDENTS: Similar past occurrences
3. EXPERT ANALYSIS: Professional assessments and opinions
4. DATA TRENDS: Statistical patterns and projections
5. SOURCE CITATIONS: Credible references and links

${domains.length > 0 ? `Prioritize sources from: ${domains.join(', ')}` : ''}
${citations ? 'Include clickable source citations and references.' : ''}`;

      const response = await axios.post(this.baseURL, {
        model: 'perplexity/sonar-large-online',
        messages: [
          {
            role: 'system',
            content: 'You are an intelligence researcher conducting deep search analysis. Provide comprehensive research with credible sources and citations.'
          },
          {
            role: 'user',
            content: searchPrompt
          }
        ],
        temperature: 0.2,
        max_tokens: 3000,
        top_p: 0.9
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://global-sentinel.ai',
          'X-Title': 'Global Sentinel Deep Search'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('🚨 Sonar Deep Search Error:', error.response?.status, error.response?.data || error.message);
      throw new Error(`Sonar deep search failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async hybridAnalysis(scenario) {
    try {
      console.log('🧠 Starting hybrid Sonar analysis for:', scenario.substring(0, 50) + '...');
      
      // Run both reasoning and deep search in parallel
      const [reasoningResult, searchResult] = await Promise.all([
        this.sonarReasoning(scenario),
        this.sonarDeepSearch(`Crisis signals and evidence for: ${scenario}`, [], true)
      ]);

      return {
        reasoning: reasoningResult,
        research: searchResult,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('🚨 Hybrid Analysis Error:', error);
      throw error;
    }
  }
}

module.exports = new SonarClient();
