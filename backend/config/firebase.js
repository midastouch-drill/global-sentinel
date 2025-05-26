
const admin = require('firebase-admin');

// Validate and clean environment variables
const validateFirebaseConfig = () => {
  const requiredVars = ['FIREBASE_PROJECT_ID', 'FIREBASE_PRIVATE_KEY', 'FIREBASE_CLIENT_EMAIL'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`❌ Missing required Firebase environment variables: ${missing.join(', ')}`);
  }

  // Clean and validate project_id
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  if (!projectId || typeof projectId !== 'string' || projectId.length === 0) {
    throw new Error('❌ FIREBASE_PROJECT_ID must be a non-empty string');
  }

  // Clean and validate private key
  let privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();
  if (!privateKey) {
    throw new Error('❌ FIREBASE_PRIVATE_KEY cannot be empty');
  }
  
  // Handle newline characters in private key
  privateKey = privateKey.replace(/\\n/g, '\n');
  
  // Validate private key format
  if (!privateKey.includes('BEGIN PRIVATE KEY') || !privateKey.includes('END PRIVATE KEY')) {
    throw new Error('❌ FIREBASE_PRIVATE_KEY appears to be malformed - missing BEGIN/END markers');
  }

  // Clean and validate client email
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  if (!clientEmail || !clientEmail.includes('@') || !clientEmail.includes('iam.gserviceaccount.com')) {
    throw new Error('❌ FIREBASE_CLIENT_EMAIL must be a valid service account email');
  }

  console.log('✅ Firebase environment variables validated successfully');
  console.log(`📋 Project ID: ${projectId}`);
  console.log(`📧 Client Email: ${clientEmail}`);
  console.log(`🔑 Private Key: ${privateKey.length} characters (${privateKey.split('\n').length} lines)`);

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

    // Create service account object
    const serviceAccount = {
      projectId: projectId,
      privateKey: privateKey,
      clientEmail: clientEmail,
    };

    // Initialize Firebase Admin
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${projectId}-default-rtdb.firebaseio.com/`,
      projectId: projectId
    });
    
    console.log('✅ Firebase Admin SDK initialized successfully');
    console.log(`🔗 Database URL: https://${projectId}-default-rtdb.firebaseio.com/`);
    
    return admin;
    
  } catch (error) {
    console.error('🚨 Firebase initialization failed:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    // Log environment variable status (without exposing values)
    console.error('\n📋 Environment check:');
    console.error('- FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? `SET (${process.env.FIREBASE_PROJECT_ID})` : 'MISSING');
    console.error('- FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? `SET (${process.env.FIREBASE_PRIVATE_KEY.length} chars)` : 'MISSING');
    console.error('- FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? `SET (${process.env.FIREBASE_CLIENT_EMAIL})` : 'MISSING');
    
    // Provide specific debugging hints
    if (error.message.includes('project_id')) {
      console.error('\n🔧 DEBUG HINT: The project_id error usually means:');
      console.error('  1. FIREBASE_PROJECT_ID is missing or empty');
      console.error('  2. FIREBASE_PROJECT_ID contains extra whitespace');
      console.error('  3. The value is not a string (check quotes in .env)');
    }
    
    if (error.message.includes('private_key') || error.message.includes('PRIVATE KEY')) {
      console.error('\n🔧 DEBUG HINT: The private_key error usually means:');
      console.error('  1. FIREBASE_PRIVATE_KEY is missing the full key content');
      console.error('  2. Newline characters (\\n) are not properly formatted');
      console.error('  3. Missing quotes around the private key in .env');
      console.error('  4. Copy the ENTIRE private key including -----BEGIN/END PRIVATE KEY-----');
    }
    
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
    
    console.log('🗄️ Firestore instance created successfully');
    return db;
  } catch (error) {
    console.error('🚨 Failed to get Firestore instance:', error.message);
    throw new Error(`Firestore initialization failed: ${error.message}`);
  }
};

// Test Firebase connection with detailed feedback
const testFirebaseConnection = async () => {
  try {
    console.log('🔄 Testing Firebase Admin SDK connection...');
    
    const firebase = initializeFirebase();
    
    // Test Firestore connection
    const db = getFirestore();
    
    // Try to read from a test collection (this will create it if it doesn't exist)
    const testDoc = await db.collection('_health_check').doc('connection_test').get();
    
    // Test Auth service
    const authService = firebase.auth();
    
    // Try to list users (will fail gracefully if no users exist)
    try {
      await authService.listUsers(1);
      console.log('🔐 Firebase Auth service: ACCESSIBLE');
    } catch (authError) {
      if (authError.code === 'auth/insufficient-permission') {
        console.log('🔐 Firebase Auth service: CONNECTED (insufficient permissions for user listing)');
      } else {
        console.warn('🔐 Firebase Auth service: LIMITED ACCESS');
      }
    }
    
    console.log('✅ Firebase connection test: SUCCESS');
    console.log('🗄️ Firestore: CONNECTED');
    
    return true;
  } catch (error) {
    console.error('🚨 Firebase connection test: FAILED');
    console.error('Error details:', error.message);
    
    if (error.code) {
      console.error('Error code:', error.code);
    }
    
    return false;
  }
};

// Graceful shutdown handler
const closeFirebaseConnections = async () => {
  try {
    if (admin.apps.length > 0) {
      await Promise.all(admin.apps.map(app => app.delete()));
      console.log('🔄 Firebase Admin apps closed gracefully');
    }
  } catch (error) {
    console.error('⚠️ Error closing Firebase connections:', error.message);
  }
};

module.exports = {
  initializeFirebase,
  getFirestore,
  testFirebaseConnection,
  closeFirebaseConnections,
  admin
};
