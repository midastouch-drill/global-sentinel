
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
    api.get(`/threats/${id}`),
  
  getTrends: () => 
    api.get('/threats/trends'),
  
  vote: (voteData: { threatId: string; vote: 'credible' | 'not_credible'; userId?: string }) =>
    api.post('/vote', voteData),
  
  verify: (verifyData: { threatId: string; sources: string[]; credibilityScore: number }) =>
    api.post('/verify', verifyData),
  
  simulate: (simulationData: { scenario: string }) =>
    api.post('/simulate', simulationData),
  
  analyze: (analysisData: { step: string; type: string }) =>
    api.post('/analyze', analysisData),
};

export default threatsApi;
