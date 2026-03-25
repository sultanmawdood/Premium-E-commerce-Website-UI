
let express;
let productController;
let authMiddleware;
let validationMiddleware;
let crypto;
let router;

// Lazy loading functions
const getExpress = () => {
  if (!express) {
    express = require('express');
  }
  return express;
};

const getProductController = () => {
  if (!productController) {
    productController = require('../controllers/productController');
  }
  return productController;
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

// Modern CSRF protection middleware for admin operations
const csrfProtectionAdmin = (req, res, next) => {
  // Skip CSRF for API endpoints that use JWT tokens
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return next();
  }

  // Skip CSRF for GET requests (read-only operations)
  if (req.method === 'GET') {
    return next();
  }

  const cryptoModule = getCrypto();
  const cookieToken = req.cookies['csrf-token'];
  const headerToken = req.headers['x-csrf-token'];

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
        error: 'CSRF token validation failed for admin operation',
        code: 'CSRF_ADMIN_VALIDATION_FAILED',
        message: 'Include X-CSRF-Token header with valid token for product management operations'
      });
    }
  }

  req.csrfToken = cookieToken;
  next();
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Set secure headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Additional security for admin operations
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
  }
  
  next();
};

// Create router with lazy loading - only when actually needed
const getRouter = () => {
  if (!router) {
    const expressInstance = getExpress();
    router = expressInstance.Router();
    
    const {
      getProducts,
      getProduct,
      createProduct,
      updateProduct,
      deleteProduct,
      getFeaturedProducts,
      getFilters,
      uploadProductImages,
      deleteProductImage
    } = getProductController();
    
    const { protect, restrictTo } = getAuthMiddleware();
    
    const {
      createProductValidation,
      updateProductValidation,
      validateId,
      paginationValidation,
      validate
    } = getValidationMiddleware();

    // Import upload middleware
    const { uploadProductImages: uploadMiddleware, processImages } = require('../middleware/upload');

    // Apply security headers to all routes
    router.use(securityHeaders);

    // Public routes (no CSRF protection needed for read-only operations)
    router.get('/', paginationValidation, validate, getProducts);
    router.get('/featured', getFeaturedProducts);
    router.get('/filters', getFilters);
    router.get('/:id', validateId, validate, getProduct);

    // CSRF token endpoint for admin operations
    router.get('/admin/csrf-token', protect, restrictTo('admin'), (req, res) => {
      const cryptoModule = getCrypto();
      const token = cryptoModule.randomBytes(32).toString('hex');
      
      res.cookie('csrf-token', token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
      });
      
      res.json({ 
        success: true, 
        csrfToken: token,
        message: 'Include this token in X-CSRF-Token header for product management operations'
      });
    });

    // Admin routes with CSRF protection
    router.post(
      '/',
      csrfProtectionAdmin,
      protect,
      restrictTo('admin'),
      createProductValidation,
      validate,
      createProduct
    );

    router.put(
      '/:id',
      csrfProtectionAdmin,
      protect,
      restrictTo('admin'),
      validateId,
      updateProductValidation,
      validate,
      updateProduct
    );

    router.delete(
      '/:id',
      csrfProtectionAdmin,
      protect,
      restrictTo('admin'),
      validateId,
      validate,
      deleteProduct
    );

    // Image upload routes
    router.post(
      '/:id/images',
      csrfProtectionAdmin,
      protect,
      restrictTo('admin'),
      validateId,
      validate,
      uploadMiddleware,
      processImages,
      uploadProductImages
    );

    router.delete(
      '/:id/images/:imageIndex',
      csrfProtectionAdmin,
      protect,
      restrictTo('admin'),
      validateId,
      validate,
      deleteProductImage
    );
  }
  
  return router;
};

// Export lazy router getter
module.exports = getRouter();
