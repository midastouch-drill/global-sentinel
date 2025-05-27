
import axios from 'axios';

const baseURL = 'http://localhost:5000';

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Enhanced error handling with user-friendly messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Core API Error:', error);
    
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Unable to connect to Global Sentinel Core. Please ensure the backend is running on localhost:5000');
    }
    
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in to access this feature.');
    }
    
    if (error.response?.status === 403) {
      throw new Error('Access denied. You do not have permission to perform this action.');
    }
    
    if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    throw error;
  }
);

export const threatsApi = {
  // Get all active threats - FIXED: Use correct endpoint /api/detect/active instead of /threats
  getAll: () => api.get('/api/detect/active'),
  
  // Get specific threat by ID
  getById: (id) => api.get(`/api/threats/${id}`),
  
  // Vote on threat
  vote: ({ threatId, voteType, userId }) => 
    api.post(`/api/vote/${threatId}`, { voteType, userId }),
  
  // Verify threat
  verify: ({ threatId, isVerified, evidence, userId }) =>
    api.post(`/api/verify/${threatId}`, { isVerified, evidence, userId }),
  
  // Run simulation
  simulate: (scenario) => api.post('/api/simulate', { scenario }),
  
  // Get trends data
  getTrends: () => api.get('/api/trends'),
  
  // Trigger threat detection
  detectThreats: () => api.post('/api/detect'),
  
  // Get active threats from detection system
  getActiveThreats: () => api.get('/api/detect/active'),
  
  // Test SIGINT scrapers
  testScraper: (scraperType) => api.post(`/api/sigint/test-${scraperType}`),
};

// Export sigintApi for compatibility
export const sigintApi = {
  testRssScrape: () => api.post('/api/sigint/test-rss'),
  testApiScrape: () => api.post('/api/sigint/test-api'),
  testHtmlScrape: () => api.post('/api/sigint/test-html'),
  testRedditScrape: () => api.post('/api/sigint/test-reddit'),
};

export default api;
