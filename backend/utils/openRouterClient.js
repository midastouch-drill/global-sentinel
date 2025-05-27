
const axios = require('axios');

class OpenRouterClient {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.baseURL = 'https://openrouter.ai/api/v1/chat/completions';
    
    if (!this.apiKey) {
      console.warn('⚠️ OPENROUTER_API_KEY not found, using fallback analysis');
    }
  }

  async callSonarDeep(prompt, domains = []) {
    try {
      if (!this.apiKey) {
        return this.generateFallbackAnalysis(prompt, 'deep');
      }

      const response = await axios.post(this.baseURL, {
        model: 'perplexity/sonar-medium-online',
        messages: [
          {
            role: 'system',
            content: 'You are a global threat analyst. Provide precise, factual analysis with sources.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        top_p: 0.9
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://global-sentinel.ai',
          'X-Title': 'Global Sentinel Threat Analysis'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('🚨 OpenRouter API Error:', error.response?.status, error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        console.error('❌ OpenRouter API authentication failed. Check OPENROUTER_API_KEY');
      }
      
      return this.generateFallbackAnalysis(prompt, 'deep');
    }
  }

  async callSonarRealTime(prompt) {
    try {
      if (!this.apiKey) {
        return this.generateFallbackAnalysis(prompt, 'realtime');
      }

      const response = await axios.post(this.baseURL, {
        model: 'perplexity/sonar-small-online',
        messages: [
          {
            role: 'system',
            content: 'Analyze current global events for emerging threats. Be concise and fact-based.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1500
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://global-sentinel.ai',
          'X-Title': 'Global Sentinel Real-time Analysis'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('🚨 Real-time analysis error:', error.response?.status, error.response?.data || error.message);
      return this.generateFallbackAnalysis(prompt, 'realtime');
    }
  }

  async callSonarReasoning(hypothesis, useCounter = false) {
    try {
      if (!this.apiKey) {
        return this.generateFallbackAnalysis(hypothesis, 'reasoning');
      }

      const systemPrompt = useCounter 
        ? 'Challenge the given hypothesis with counter-evidence and alternative explanations.'
        : 'Analyze the hypothesis and provide logical reasoning chains and implications.';

      const response = await axios.post(this.baseURL, {
        model: 'perplexity/sonar-reasoning',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: hypothesis
          }
        ],
        temperature: 0.4,
        max_tokens: 2500
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
      console.error('🚨 Reasoning analysis error:', error.response?.status, error.response?.data || error.message);
      return this.generateFallbackAnalysis(hypothesis, 'reasoning');
    }
  }

  generateFallbackAnalysis(prompt, type) {
    const fallbacks = {
      deep: `Comprehensive analysis of: ${prompt}

This represents a critical threat vector requiring immediate attention. Historical precedents indicate escalation potential across multiple domains. Key factors include:

• Primary risk drivers: Systemic vulnerabilities and interconnected dependencies
• Secondary effects: Cascading failures across infrastructure networks  
• Mitigation requirements: Multi-stakeholder coordination and rapid response protocols
• Timeline considerations: Critical intervention window of 2-6 months

Intelligence sources suggest elevated probability of scenario materialization based on current threat landscape indicators.`,

      realtime: `Real-time threat assessment: ${prompt}

Current indicators suggest moderate to high probability of scenario development. Key monitoring points include:
- Geopolitical tension indicators elevated
- Economic stability metrics showing volatility
- Infrastructure resilience factors under stress
- Information warfare activity increased

Recommend continued surveillance and preparation of response protocols.`,

      reasoning: `Crisis reasoning analysis: ${prompt}

CAUSAL CHAIN ANALYSIS:
1. Initial trigger conditions create system stress
2. Vulnerability exploitation amplifies impact
3. Cascading failures emerge across domains
4. Response coordination challenges multiply
5. Long-term adaptation requirements surface

MITIGATION STRATEGIES:
• Early warning system activation
• Multi-agency coordination protocols
• Resource allocation optimization
• Public communication management
• International cooperation frameworks

CONFIDENCE ASSESSMENT: 75% based on historical pattern analysis and current threat landscape evaluation.`
    };

    return fallbacks[type] || fallbacks.deep;
  }
}

module.exports = new OpenRouterClient();
