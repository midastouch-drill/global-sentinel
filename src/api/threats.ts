
import { authClient } from './authClient';

export const threatsApi = {
  getAll: () => authClient.get('/api/detect/active'),
  getById: (id: string) => authClient.get(`/api/threats/${id}`),
  getTrends: () => authClient.get('/api/trends'),
  vote: (data: { threatId: string; vote: 'credible' | 'not_credible' }) => 
    authClient.post('/api/vote', data),
  verify: (data: { threatId: string; sources: string[]; credibilityScore: number }) => 
    authClient.post('/api/verify', data),
  simulate: (data: { scenario: string; parameters: any }) => 
    authClient.post('/api/simulate', data),
};

export const sigintApi = {
  testRssScrape: () => authClient.post('/api/sigint/test-rss'),
  testApiScrape: () => authClient.post('/api/sigint/test-api'),
  testHtmlScrape: () => authClient.post('/api/sigint/test-html'),
  testRedditScrape: () => authClient.post('/api/sigint/test-reddit'),
};
