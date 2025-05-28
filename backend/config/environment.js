
const path = require('path');
const fs = require('fs');

// Load environment variables from .env file if it exists
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

// Firebase configuration with fallbacks for development
const getFirebaseConfig = () => {
  // Check if Firebase variables are set
  const requiredVars = ['FIREBASE_PROJECT_ID', 'FIREBASE_PRIVATE_KEY', 'FIREBASE_CLIENT_EMAIL'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn('⚠️  Missing Firebase environment variables:', missingVars.join(', '));
    console.warn('💡 Create a .env file with your Firebase credentials to enable database features');
    
    // Return mock config for development
    return {
      projectId: 'demo-project',
      privateKey: '-----BEGIN PRIVATE KEY-----\nMOCK_KEY_FOR_DEVELOPMENT\n-----END PRIVATE KEY-----\n',
      clientEmail: 'demo@demo-project.iam.gserviceaccount.com',
      isDemoMode: true
    };
  }

  return {
    projectId: process.env.FIREBASE_PROJECT_ID?.trim(),
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.trim().replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL?.trim(),
    isDemoMode: false
  };
};

module.exports = {
  getFirebaseConfig,
  isDevelopment: process.env.NODE_ENV !== 'production',
  port: process.env.PORT || 5000
};
