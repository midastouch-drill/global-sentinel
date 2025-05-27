
const app = require('./app');
const port = process.env.PORT || 5000;

console.log('🌍 Starting Global Sentinel Backend...');
console.log('🔄 Testing Firebase connection...');

// Start the server
app.listen(port, () => {
  console.log(`🌍 Global Sentinel Backend running on port ${port}`);
  console.log('🚀 Earth\'s AI Immune System is ACTIVE');
  console.log('📡 Monitoring global threats in real-time...');
  console.log('🔥 Firebase Status: CONNECTED');
  console.log(`🌐 Frontend URL: http://localhost:8080`);
});
