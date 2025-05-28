
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const threatsApi = {
  getAll: (page = 1, limit = 10) => 
    api.get(`/detect/threats?page=${page}&limit=${limit}`),
  
  getById: (id: string) => 
    api.get(`/detect/threats/${id}`),
  
  getTrends: () => 
    api.get('/trends'),
  
  vote: (voteData: { threatId: string; vote: 'credible' | 'not_credible'; userId?: string }) =>
    api.post('/vote', voteData),
  
  verify: (verifyData: { threatId?: string; claim: string; userId?: string }) =>
    api.post('/verify', verifyData),
  
  simulate: (simulationData: { scenario: string }) =>
    api.post('/simulate', simulationData),
  
  analyze: (analysisData: { step: string; type: string }) =>
    api.post('/crisis/analyze', analysisData),

  analyzeCrisis: (analysisData: { scenario: string; analysisType: string }) =>
    api.post('/crisis/analyze', analysisData),

  deepAnalysis: (analysisData: { crisisStep: string; analysisType: string }) =>
    api.post('/crisis/deep-analysis', analysisData),
};

export const sigintApi = {
  testRssScrape: () => api.post('/sigint/test-rss-scrape'),
  testApiScrape: () => api.post('/sigint/test-api-scrape'),
  testHtmlScrape: () => api.post('/sigint/test-html-scrape'),
  testRedditScrape: () => api.post('/sigint/test-reddit-scrape'),
};

export default threatsApi;
