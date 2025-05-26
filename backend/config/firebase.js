
const admin = require('firebase-admin');

// Validate and clean environment variables
const validateFirebaseConfig = () => {
  const requiredVars = ['FIREBASE_PROJECT_ID', 'FIREBASE_PRIVATE_KEY', 'FIREBASE_CLIENT_EMAIL'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required Firebase environment variables: ${missing.join(', ')}`);
  }

  // Clean and validate project_id
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  if (!projectId || typeof projectId !== 'string') {
    throw new Error('FIREBASE_PROJECT_ID must be a non-empty string');
  }

  // Clean and validate private key
  let privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();
  if (!privateKey) {
    throw new Error('FIREBASE_PRIVATE_KEY cannot be empty');
  }
  
  // Handle newline characters in private key
  privateKey = privateKey.replace(/\\n/g, '\n');
  
  // Validate private key format
  if (!privateKey.includes('BEGIN PRIVATE KEY') || !privateKey.includes('END PRIVATE KEY')) {
    throw new Error('FIREBASE_PRIVATE_KEY appears to be malformed - missing BEGIN/END markers');
  }

  // Clean and validate client email
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  if (!clientEmail || !clientEmail.includes('@')) {
    throw new Error('FIREBASE_CLIENT_EMAIL must be a valid email address');
  }

  return {
    projectId,
    privateKey,
    clientEmail
  };
};

// Initialize Firebase Admin SDK with comprehensive error handling
const initializeFirebase = () => {
  try {
    // Check if already initialized
    if (admin.apps.length > 0) {
      console.log('🔥 Firebase Admin SDK already initialized');
      return admin;
    }

    console.log('🔄 Initializing Firebase Admin SDK...');
    
    // Validate environment variables
    const { projectId, privateKey, clientEmail } = validateFirebaseConfig();
    
    console.log(`📋 Project ID: ${projectId}`);
    console.log(`📧 Client Email: ${clientEmail}`);
    console.log(`🔑 Private Key: ${privateKey.length} characters`);

    // Create service account object
    const serviceAccount = {
      projectId: projectId,
      privateKey: privateKey,
      clientEmail: clientEmail,
    };

    // Initialize Firebase Admin
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${projectId}-default-rtdb.firebaseio.com/`,
      projectId: projectId
    });
    
    console.log('✅ Firebase Admin SDK initialized successfully');
    return admin;
    
  } catch (error) {
    console.error('🚨 Firebase initialization failed:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    // Log environment variable status (without exposing values)
    console.error('Environment check:');
    console.error('- FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? 'SET' : 'MISSING');
    console.error('- FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? 'SET' : 'MISSING');
    console.error('- FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? 'SET' : 'MISSING');
    
    throw error;
  }
};

const getFirestore = () => {
  try {
    const firebase = initializeFirebase();
    const db = firebase.firestore();
    
    // Configure Firestore settings for better performance
    db.settings({
      ignoreUndefinedProperties: true
    });
    
    return db;
  } catch (error) {
    console.error('🚨 Failed to get Firestore instance:', error.message);
    throw new Error(`Firestore initialization failed: ${error.message}`);
  }
};

// Test Firebase connection
const testFirebaseConnection = async () => {
  try {
    const db = getFirestore();
    
    // Try to read from a test collection
    const testDoc = await db.collection('_health_check').doc('test').get();
    console.log('🔗 Firebase connection test: SUCCESS');
    return true;
  } catch (error) {
    console.error('🔗 Firebase connection test: FAILED', error.message);
    return false;
  }
};

module.exports = {
  initializeFirebase,
  getFirestore,
  testFirebaseConnection,
  admin
};
