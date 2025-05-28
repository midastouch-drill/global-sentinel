
const admin = require('firebase-admin');
const { createLogger, format, transports } = require('winston');
const { getFirebaseConfig } = require('./environment');

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
let firebaseInitialized = false;
let isDemoMode = false;

// Enhanced validation with production checks
const validateFirebaseConfig = () => {
  const config = getFirebaseConfig();
  
  if (config.isDemoMode) {
    logger.warn('🚧 Running in demo mode - Firebase features will use mock data');
    isDemoMode = true;
    return config;
  }

  if (config.privateKey.length < 100) {
    const error = new Error('Private key appears too short - potential configuration error');
    logger.error(error.message, { keyLength: config.privateKey.length });
    throw error;
  }

  logger.info('Firebase environment variables validated', {
    projectId: config.projectId,
    clientEmail: config.clientEmail,
    keyLength: config.privateKey.length
  });

  return config;
};

// Production-ready initialization with retry logic
const initializeFirebase = (retryCount = 0) => {
  try {
    if (firebaseInitialized) {
      logger.debug('Firebase Admin SDK already initialized');
      return admin;
    }

    logger.info('Initializing Firebase Admin SDK...');
    
    const config = validateFirebaseConfig();

    if (isDemoMode) {
      logger.info('Firebase initialized in demo mode');
      firebaseInitialized = true;
      return null; // Return null for demo mode
    }

    const serviceAccount = {
      projectId: config.projectId,
      privateKey: config.privateKey,
      clientEmail: config.clientEmail,
    };

    const firebaseConfig = {
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${config.projectId}-default-rtdb.firebaseio.com/`,
      projectId: config.projectId,
      storageBucket: `${config.projectId}.appspot.com`
    };

    const app = admin.initializeApp(firebaseConfig);
    firebaseInitialized = true;
    
    logger.info('Firebase Admin SDK initialized successfully', {
      projectId: config.projectId,
      databaseURL: firebaseConfig.databaseURL
    });
    
    return admin;
    
  } catch (error) {
    logger.error('Firebase initialization failed', {
      error: error.message,
      stack: error.stack,
      retryCount
    });

    // In demo mode, don't retry
    if (isDemoMode) {
      logger.info('Continuing in demo mode...');
      return null;
    }

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
    if (isDemoMode) {
      // Return mock Firestore interface for demo mode
      return {
        collection: (name) => ({
          doc: (id) => ({
            get: () => Promise.resolve({ exists: false, data: () => null }),
            set: (data) => Promise.resolve(),
            update: (data) => Promise.resolve(),
            delete: () => Promise.resolve()
          }),
          add: (data) => Promise.resolve({ id: 'mock_id' }),
          where: () => ({ get: () => Promise.resolve({ docs: [] }) }),
          orderBy: () => ({ limit: () => ({ get: () => Promise.resolve({ docs: [] }) }) }),
          limit: () => ({ get: () => Promise.resolve({ docs: [] }) })
        })
      };
    }

    if (firestoreInstance) {
      return firestoreInstance;
    }

    const firebase = initializeFirebase();
    if (!firebase) {
      throw new Error('Firebase not initialized');
    }
    
    firestoreInstance = firebase.firestore();
    
    // Only set settings once during initialization
    if (!firebaseInitialized) {
      firestoreInstance.settings({
        ignoreUndefinedProperties: true,
        timestampsInSnapshots: true
      });
    }
    
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
    if (isDemoMode) {
      logger.info('Firebase connection test skipped (demo mode)');
      return true;
    }

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
    
    return true;
  } catch (error) {
    logger.error('Firebase connection test failed', {
      error: error.message,
      code: error.code,
      stack: error.stack
    });
    
    return false;
  }
};

module.exports = {
  initializeFirebase,
  getFirestore,
  testFirebaseConnection,
  admin,
  logger,
  isDemoMode: () => isDemoMode
};
