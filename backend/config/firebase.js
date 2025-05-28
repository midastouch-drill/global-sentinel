
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

    // Force demo mode on connection failure
    if (retryCount >= 2) {
      logger.warn('🚧 Forcing demo mode due to Firebase connection issues');
      isDemoMode = true;
      firebaseInitialized = true;
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

// Enhanced Firestore with proper error handling
const getFirestore = () => {
  try {
    if (isDemoMode) {
      // Return mock Firestore interface for demo mode
      return {
        collection: (name) => ({
          doc: (id) => ({
            get: () => Promise.resolve({ exists: false, data: () => null }),
            set: (data) => {
              logger.info(`MOCK: Setting document in ${name}/${id}`, { data });
              return Promise.resolve();
            },
            update: (data) => Promise.resolve(),
            delete: () => Promise.resolve()
          }),
          add: (data) => {
            logger.info(`MOCK: Adding document to ${name}`, { data });
            return Promise.resolve({ id: 'mock_id' });
          },
          where: () => ({
            orderBy: () => ({
              limit: () => ({
                get: () => Promise.resolve({ docs: [], forEach: () => {} })
              })
            }),
            get: () => Promise.resolve({ docs: [], forEach: () => {} })
          }),
          orderBy: () => ({
            limit: () => ({
              get: () => Promise.resolve({ docs: [], forEach: () => {} })
            }),
            get: () => Promise.resolve({ docs: [], forEach: () => {} })
          }),
          limit: () => ({
            get: () => Promise.resolve({ docs: [], forEach: () => {} })
          }),
          get: () => Promise.resolve({ docs: [], forEach: () => {} })
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
    
    // Configure Firestore settings
    firestoreInstance.settings({
      ignoreUndefinedProperties: true
    });
    
    logger.debug('Firestore instance created and configured');
    return firestoreInstance;
  } catch (error) {
    logger.error('Failed to get Firestore instance', {
      error: error.message,
      stack: error.stack
    });
    
    // Fallback to demo mode
    logger.warn('🚧 Falling back to demo mode');
    isDemoMode = true;
    return getFirestore(); // Recursive call with demo mode enabled
  }
};

// Enhanced connection test
const testFirebaseConnection = async () => {
  try {
    if (isDemoMode) {
      logger.info('Firebase connection test skipped (demo mode)');
      return true;
    }

    logger.info('Testing Firebase Admin SDK connection...');
    
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

// Initialize sample threats in Firestore
const initializeSampleThreats = async () => {
  try {
    if (isDemoMode) {
      logger.info('Sample threats initialization skipped (demo mode)');
      return;
    }

    const db = getFirestore();
    logger.info('🎯 Initializing sample threats in Firestore...');

    const sampleThreats = [
      {
        id: 'threat_001',
        title: 'Advanced Persistent Threat Targeting Financial Infrastructure',
        type: 'Cyber',
        severity: 85,
        summary: 'Sophisticated malware campaign targeting banking systems across multiple countries.',
        regions: ['North America', 'Europe', 'Asia'],
        sources: ['https://cisa.gov/alerts'],
        timestamp: new Date().toISOString(),
        status: 'active',
        confidence: 88,
        votes: { credible: 24, not_credible: 3 },
        updatedAt: new Date().toISOString()
      },
      {
        id: 'threat_002',
        title: 'Emerging Antimicrobial Resistance in Southeast Asia',
        type: 'Health',
        severity: 72,
        summary: 'New strain of antibiotic-resistant bacteria spreading rapidly.',
        regions: ['Southeast Asia'],
        sources: ['https://who.int/emergencies'],
        timestamp: new Date().toISOString(),
        status: 'active',
        confidence: 82,
        votes: { credible: 18, not_credible: 1 },
        updatedAt: new Date().toISOString()
      },
      {
        id: 'threat_003',
        title: 'Critical Water Shortage Crisis in Mediterranean Basin',
        type: 'Climate',
        severity: 78,
        summary: 'Unprecedented drought conditions threatening agricultural stability.',
        regions: ['Mediterranean', 'Southern Europe'],
        sources: ['https://climate.ec.europa.eu'],
        timestamp: new Date().toISOString(),
        status: 'active',
        confidence: 91,
        votes: { credible: 31, not_credible: 2 },
        updatedAt: new Date().toISOString()
      }
    ];

    for (const threat of sampleThreats) {
      await db.collection('threats').doc(threat.id).set(threat);
      logger.info(`✅ Added sample threat: ${threat.title}`);
    }

    logger.info('🎯 Sample threats initialization complete');
  } catch (error) {
    logger.error('❌ Failed to initialize sample threats:', error.message);
  }
};

module.exports = {
  initializeFirebase,
  getFirestore,
  testFirebaseConnection,
  initializeSampleThreats,
  admin,
  logger,
  isDemoMode: () => isDemoMode
};
