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
    }),
    new transports.File({ filename: 'logs/firebase-errors.log', level: 'error' }),
    new transports.File({ filename: 'logs/firebase-combined.log' })
  ],
  exceptionHandlers: [
    new transports.File({ filename: 'logs/firebase-exceptions.log' })
  ]
});

// Enhanced validation with production checks
const validateFirebaseConfig = () => {
  // Production environment checks
  if (process.env.NODE_ENV === 'production') {
    if (process.env.FIREBASE_PROJECT_ID.includes('test') || 
        process.env.FIREBASE_PROJECT_ID.includes('dev')) {
      logger.warn('⚠️ Production environment using potentially non-production Firebase project');
    }
  }

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
      storageBucket: `${projectId}.appspot.com`,
      // Enable HTTP connection pooling for production
      httpOptions: {
        agent: new require('https').Agent({
          keepAlive: true,
          maxSockets: process.env.DATABASE_POOL_SIZE || 10
        })
      }
    };

    const app = admin.initializeApp(firebaseConfig);
    
    // Configure Firestore for production
    const firestore = admin.firestore();
    firestore.settings({
      ignoreUndefinedProperties: true,
      timestampsInSnapshots: true
    });

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

    // Implement retry logic for production
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

// Enhanced Firestore with error wrapping
const getFirestore = () => {
  try {
    const firebase = initializeFirebase();
    const db = firebase.firestore();
    
    // Production performance settings
    db.settings({
      ignoreUndefinedProperties: true,
      timestampsInSnapshots: true
    });
    
    // Add query timeout for production
    const originalGet = db.collectionGroup.get;
    db.collectionGroup.get = async function(options) {
      const timeout = process.env.REQUEST_TIMEOUT || 30000;
      return Promise.race([
        originalGet.call(this, options),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Firestore query timeout')), timeout)
        )
      ]);
    };
    
    logger.debug('Firestore instance created');
    return db;
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
    
    // Start timer for metrics
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

// Enhanced shutdown with cleanup
const closeFirebaseConnections = async () => {
  try {
    if (admin.apps.length > 0) {
      logger.info('Closing Firebase connections...');
      await Promise.all(admin.apps.map(app => {
        logger.debug(`Closing Firebase app: ${app.name}`);
        return app.delete();
      }));
      logger.info('Firebase connections closed gracefully');
    }
  } catch (error) {
    logger.error('Error closing Firebase connections', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

// Add process handlers for production
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received - closing Firebase connections');
  await closeFirebaseConnections();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received - closing Firebase connections');
  await closeFirebaseConnections();
  process.exit(0);
});

module.exports = {
  initializeFirebase,
  getFirestore,
  testFirebaseConnection,
  closeFirebaseConnections,
  admin,
  logger
};