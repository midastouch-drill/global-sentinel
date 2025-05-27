
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const threatsApi = {
  getAll: async () => {
    try {
      const response = await api.get('/api/detect/threats');
      return response;
    } catch (error) {
      console.error('Core API Error:', error);
      // Return mock data if backend is down
      return {
        data: {
          success: true,
          threats: [
            {
              id: 'mock_threat_1',
              title: 'Demo Cyber Security Alert',
              type: 'Cyber',
              severity: 75,
              summary: 'This is a demonstration threat for UI testing purposes.',
              regions: ['Global'],
              sources: ['Demo Source'],
              timestamp: new Date().toISOString(),
              status: 'active',
              confidence: 85,
              votes: { credible: 12, not_credible: 3 }
            }
          ]
        }
      };
    }
  },

  getById: async (id: string) => {
    const response = await api.get(`/api/detect/threats/${id}`);
    return response;
  },

  getTrends: async () => {
    const response = await api.get('/api/trends');
    return response;
  },

  vote: async (data: { threatId: string; vote: 'credible' | 'not_credible' }) => {
    const response = await api.post('/api/vote', data);
    return response;
  },

  verify: async (data: { threatId: string; sources: string[]; credibilityScore: number }) => {
    const response = await api.post('/api/verify', data);
    return response;
  },

  simulate: async (data: { scenario: string; parameters?: any }) => {
    const response = await api.post('/api/simulate', data);
    return response;
  },

  analyzeCrisis: async (data: { scenario: string; analysisType: string }) => {
    // Mock implementation for crisis analysis
    return {
      data: {
        analysis: {
          scenario: data.scenario,
          causalTree: [
            'Initial trigger event occurs',
            'Secondary systems affected',
            'Cascading failures begin',
            'Crisis escalates regionally'
          ],
          riskFactors: [
            'System interdependencies',
            'Limited response capacity',
            'Communication breakdown'
          ],
          mitigationStrategies: [
            'Activate emergency protocols',
            'Coordinate response teams',
            'Implement contingency plans'
          ],
          confidence: 78,
          severity: 'High',
          timeframe: '2-6 months',
          affectedRegions: ['Regional'],
          sources: ['AI Analysis', 'Historical Data']
        }
      }
    };
  },

  deepAnalysis: async (data: { crisisStep: string; analysisType: string }) => {
    // Mock implementation for deep analysis
    return {
      data: {
        analysis: `Deep intelligence analysis of: ${data.crisisStep}. This represents a significant threat vector with multiple potential escalation pathways. Historical precedents suggest immediate intervention is required.`,
        sources: ['Intelligence Database', 'OSINT Sources', 'Academic Research'],
        confidence: 85,
        recommendations: [
          'Monitor situation closely',
          'Prepare response protocols',
          'Coordinate with stakeholders'
        ]
      }
    };
  }
};

export const sigintApi = {
  testRssScrape: async () => {
    const response = await api.post('/api/sigint/test-rss');
    return response;
  },

  testApiScrape: async () => {
    const response = await api.post('/api/sigint/test-api');
    return response;
  },

  testHtmlScrape: async () => {
    const response = await api.post('/api/sigint/test-html');
    return response;
  },

  testRedditScrape: async () => {
    const response = await api.post('/api/sigint/test-reddit');
    return response;
  },
};

export default threatsApi;
