
const axios = require('axios');

class OpenRouterClient {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.baseURL = 'https://openrouter.ai/api/v1/chat/completions';
  }

  async callSonarDeep(prompt, domains = []) {
    try {
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
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('🚨 OpenRouter API Error:', error.message);
      throw new Error('AI analysis system temporarily unavailable');
    }
  }

  async callSonarRealTime(prompt) {
    try {
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
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('🚨 Real-time analysis error:', error.message);
      throw new Error('Real-time threat monitoring unavailable');
    }
  }

  async callSonarReasoning(hypothesis, useCounter = false) {
    try {
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
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('🚨 Reasoning analysis error:', error.message);
      throw new Error('Threat reasoning system unavailable');
    }
  }
}

module.exports = new OpenRouterClient();
