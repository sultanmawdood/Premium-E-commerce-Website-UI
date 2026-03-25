// Lazy load dependencies
let express;
let authController;
let authMiddleware;
let validationMiddleware;
let crypto;

// Lazy loading functions
const getExpress = () => {
  if (!express) {
    express = require('express');
  }
  return express;
};

const getAuthController = () => {
  if (!authController) {
    authController = require('../controllers/authController');
  }
  return authController;
};

const getAuthMiddleware = () => {
  if (!authMiddleware) {
    authMiddleware = require('../middleware/auth');
  }
  return authMiddleware;
};

const getValidationMiddleware = () => {
  if (!validationMiddleware) {
    validationMiddleware = require('../middleware/validation');
  }
  return validationMiddleware;
};

const getCrypto = () => {
  if (!crypto) {
    crypto = require('crypto');
  }
  return crypto;
};

// Modern CSRF protection middleware
const csrfProtection = (req, res, next) => {
  // Skip CSRF for API endpoints that use JWT tokens
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return next();
  }

  // Skip CSRF for GET requests (read-only operations)
  if (req.method === 'GET') {
    return next();
  }

  const cryptoModule = getCrypto();
  const token = req.headers['x-csrf-token'] || req.body._csrf || req.query._csrf;
  const sessionToken = req.session?.csrfToken;

  // Generate CSRF token if not exists
  if (!sessionToken) {
    req.session = req.session || {};
    req.session.csrfToken = cryptoModule.randomBytes(32).toString('hex');
  }

  // Validate CSRF token for state-changing operations
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
    if (!token || !sessionToken || !cryptoModule.timingSafeEqual(
      Buffer.from(token, 'hex'),
      Buffer.from(sessionToken, 'hex')
    )) {
      return res.status(403).json({
        success: false,
        error: 'Invalid CSRF token',
        code: 'CSRF_TOKEN_MISMATCH'
      });
    }
  }

  next();
};

// Double Submit Cookie Pattern for additional security
const doubleSubmitCookie = (req, res, next) => {
  const cryptoModule = getCrypto();
  const cookieToken = req.cookies['csrf-token'];
  const headerToken = req.headers['x-csrf-token'];

  // Skip for JWT-based API requests
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return next();
  }

  // Generate token if not exists
  if (!cookieToken) {
    const token = cryptoModule.randomBytes(32).toString('hex');
    res.cookie('csrf-token', token, {
      httpOnly: false, // Client needs to read this for header
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    req.csrfToken = token;
    return next();
  }

  // Validate for state-changing operations
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
    if (!headerToken || cookieToken !== headerToken) {
      return res.status(403).json({
        success: false,
        error: 'CSRF token validation failed',
        code: 'CSRF_VALIDATION_FAILED'
      });
    }
  }

  req.csrfToken = cookieToken;
  next();
};

// SameSite cookie protection
const sameSiteProtection = (req, res, next) => {
  // Check for SameSite cookie support
  const userAgent = req.headers['user-agent'] || '';
  const isModernBrowser = !userAgent.includes('Chrome/5') && !userAgent.includes('Safari/5');

  if (isModernBrowser) {
    // Set secure headers for modern browsers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  }

  next();
};

// Create router with lazy loading
const createRouter = () => {
  const expressInstance = getExpress();
  const router = expressInstance.Router();
  
  const {
    register,
    login,
    refreshToken,
    logout,
    getMe,
    updateProfile,
    updatePassword
  } = getAuthController();
  
  const { protect, verifyRefreshToken } = getAuthMiddleware();
  
  const {
    registerValidation,
    loginValidation,
    updateProfileValidation,
    validate
  } = getValidationMiddleware();

  // Apply security headers to all routes
  router.use(sameSiteProtection);

  // CSRF token endpoint
  router.get('/csrf-token', doubleSubmitCookie, (req, res) => {
    res.json({ 
      success: true, 
      csrfToken: req.csrfToken,
      message: 'Include this token in X-CSRF-Token header for state-changing requests'
    });
  });

  // Apply CSRF protection to state-changing operations
  router.post('/register', doubleSubmitCookie, registerValidation, validate, register);
  router.post('/login', doubleSubmitCookie, loginValidation, validate, login);
  router.post('/refresh', doubleSubmitCookie, verifyRefreshToken, refreshToken);
  router.post('/logout', doubleSubmitCookie, protect, logout);
  
  // Read-only operations don't need CSRF protection
  router.get('/me', protect, getMe);
  
  // State-changing operations need CSRF protection
  router.put('/profile', doubleSubmitCookie, protect, updateProfileValidation, validate, updateProfile);
  router.put('/password', doubleSubmitCookie, protect, updatePassword);

  return router;
};

module.exports = createRouter();
