
import axios from 'axios';

const CORE_API_URL = 'http://localhost:5000';
const SIGINT_API_URL = 'http://localhost:4000';

const coreApi = axios.create({
  baseURL: CORE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const sigintApi = axios.create({
  baseURL: SIGINT_API_URL,
  timeout: 15000,
});

// Core API endpoints
export const threatsApi = {
  getAll: () => coreApi.get('/threats'),
  getById: (id) => coreApi.get(`/threats/${id}`),
  detect: (data) => coreApi.post('/detect', data),
  vote: (data) => coreApi.post('/vote', data),
  verify: (data) => coreApi.post('/verify', data),
  getTrends: () => coreApi.get('/trends'),
  simulate: (data) => coreApi.post('/simulate', data),
  getSimulations: () => coreApi.get('/simulations'),
};

// SIGINT API endpoints
export const sigintApi = {
  testRssScrape: () => sigintApi.get('/test-scrape/rss'),
  testApiScrape: () => sigintApi.get('/test-scrape/api'),
  testHtmlScrape: () => sigintApi.get('/test-scrape/html'),
  testRedditScrape: () => sigintApi.get('/test-scrape/reddit'),
};

// Error handling
coreApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Core API Error:', error);
    return Promise.reject(error);
  }
);

sigintApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('SIGINT API Error:', error);
    return Promise.reject(error);
  }
);
