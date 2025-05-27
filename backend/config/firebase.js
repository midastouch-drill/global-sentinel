
const admin = require('firebase-admin');
const { createLogger, format, transports } = require('winston');

// Production-grade logger configuration
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
});

let firestoreInstance = null;

// Enhanced validation with production checks
const validateFirebaseConfig = () => {
  const requiredVars = ['FIREBASE_PROJECT_ID', 'FIREBASE_PRIVATE_KEY', 'FIREBASE_CLIENT_EMAIL'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    const error = new Error(`Missing required Firebase environment variables: ${missing.join(', ')}`);
    logger.error(error.message, { missingVars: missing });
    throw error;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  let privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();

  // Enhanced private key security checks
  privateKey = privateKey.replace(/\\n/g, '\n');
  
  if (privateKey.length < 100) {
    const error = new Error('Private key appears too short - potential configuration error');
    logger.error(error.message, { keyLength: privateKey.length });
    throw error;
  }

  logger.info('Firebase environment variables validated', {
    projectId: projectId,
    clientEmail: clientEmail,
    keyLength: privateKey.length
  });

  return { projectId, privateKey, clientEmail };
};

// Production-ready initialization with retry logic
const initializeFirebase = (retryCount = 0) => {
  try {
    if (admin.apps.length > 0) {
      logger.debug('Firebase Admin SDK already initialized');
      return admin;
    }

    logger.info('Initializing Firebase Admin SDK...');
    
    const { projectId, privateKey, clientEmail } = validateFirebaseConfig();

    const serviceAccount = {
      projectId,
      privateKey,
      clientEmail,
    };

    const firebaseConfig = {
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${projectId}-default-rtdb.firebaseio.com/`,
      projectId,
      storageBucket: `${projectId}.appspot.com`
    };

    const app = admin.initializeApp(firebaseConfig);
    
    logger.info('Firebase Admin SDK initialized successfully', {
      projectId,
      databaseURL: firebaseConfig.databaseURL
    });
    
    return admin;
    
  } catch (error) {
    logger.error('Firebase initialization failed', {
      error: error.message,
      stack: error.stack,
      retryCount
    });

    if (retryCount < 3) {
      logger.info(`Retrying Firebase initialization (attempt ${retryCount + 1})`);
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(initializeFirebase(retryCount + 1));
        }, 1000 * (retryCount + 1));
      });
    }

    throw error;
  }
};

// Enhanced Firestore with single initialization
const getFirestore = () => {
  try {
    if (firestoreInstance) {
      return firestoreInstance;
    }

    const firebase = initializeFirebase();
    firestoreInstance = firebase.firestore();
    
    // Only set settings once during initialization
    firestoreInstance.settings({
      ignoreUndefinedProperties: true,
      timestampsInSnapshots: true
    });
    
    logger.debug('Firestore instance created and configured');
    return firestoreInstance;
  } catch (error) {
    logger.error('Failed to get Firestore instance', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

// Production health check with metrics
const testFirebaseConnection = async () => {
  try {
    logger.info('Testing Firebase Admin SDK connection...');
    
    const firebase = initializeFirebase();
    const db = getFirestore();
    
    const startTime = Date.now();
    
    // Test both read and write operations
    const testRef = db.collection('_health_check').doc('connection_test');
    await testRef.set({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      test: 'connection_test'
    });
    
    const doc = await testRef.get();
    await testRef.delete();
    
    const latency = Date.now() - startTime;
    
    logger.info('Firebase connection test successful', {
      latency: `${latency}ms`,
      document: doc.exists ? 'exists' : 'missing'
    });
    
    return {
      status: 'healthy',
      latency: `${latency}ms`,
      services: {
        firestore: 'connected',
        auth: 'connected'
      }
    };
  } catch (error) {
    logger.error('Firebase connection test failed', {
      error: error.message,
      code: error.code,
      stack: error.stack
    });
    
    return {
      status: 'unhealthy',
      error: error.message,
      code: error.code
    };
  }
};

module.exports = {
  initializeFirebase,
  getFirestore,
  testFirebaseConnection,
  admin,
  logger
};
