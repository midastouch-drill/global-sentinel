
const { admin } = require('../config/firebase');

/**
 * Middleware to verify Firebase ID tokens
 * Extracts and verifies the Firebase token from Authorization header
 */
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header'
      });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    if (!idToken) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided'
      });
    }

    // Verify the ID token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Add user info to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      name: decodedToken.name,
      picture: decodedToken.picture,
      // Add any custom claims
      customClaims: decodedToken.customClaims || {}
    };

    console.log(`🔐 Authenticated user: ${req.user.email} (${req.user.uid})`);
    next();
    
  } catch (error) {
    console.error('🚨 Token verification failed:', error.message);
    
    // Handle specific Firebase Auth errors
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        error: 'Token Expired',
        message: 'Firebase ID token has expired'
      });
    }
    
    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({
        error: 'Token Revoked',
        message: 'Firebase ID token has been revoked'
      });
    }
    
    if (error.code === 'auth/invalid-id-token') {
      return res.status(401).json({
        error: 'Invalid Token',
        message: 'Firebase ID token is invalid'
      });
    }

    return res.status(401).json({
      error: 'Authentication Failed',
      message: 'Failed to verify authentication token'
    });
  }
};

/**
 * Optional middleware - allows both authenticated and unauthenticated requests
 * Adds user info if token is present and valid, but doesn't block if missing
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1];
      
      if (idToken) {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          emailVerified: decodedToken.email_verified,
          name: decodedToken.name,
          picture: decodedToken.picture,
          customClaims: decodedToken.customClaims || {}
        };
      }
    }
    
    next();
  } catch (error) {
    // Log the error but don't block the request
    console.warn('⚠️ Optional auth failed:', error.message);
    next();
  }
};

module.exports = {
  verifyFirebaseToken,
  optionalAuth
};
