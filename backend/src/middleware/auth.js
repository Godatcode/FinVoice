const { verifyIdToken } = require('../config/firebase');

// Middleware to verify Firebase ID token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'No authorization header provided' 
      });
    }

    const token = authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'No token provided' 
      });
    }

    // Verify the Firebase ID token
    const result = await verifyIdToken(token);
    
    if (!result.success) {
      return res.status(403).json({ 
        error: 'Invalid token', 
        message: result.error 
      });
    }

    // Add user info to request object
    req.user = result.user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      error: 'Authentication failed', 
      message: 'Internal server error during authentication' 
    });
  }
};

// Simple user ID authentication middleware (for endpoints that expect user ID in Authorization header)
const authenticateUserId = async (req, res, next) => {
  try {
    const userId = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userId) {
      return res.status(401).json({ 
        error: 'Access denied', 
        message: 'No user ID provided in authorization header' 
      });
    }

    // Add user ID to request object
    req.userId = userId;
    next();
  } catch (error) {
    console.error('User ID authentication error:', error);
    return res.status(500).json({ 
      error: 'Authentication failed', 
      message: 'Internal server error during authentication' 
    });
  }
};

// Optional authentication middleware (for endpoints that can work with or without auth)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const result = await verifyIdToken(token);
        if (result.success) {
          req.user = result.user;
        }
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = {
  authenticateToken,
  authenticateUserId,
  optionalAuth
};
