require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const compression = require('compression');

// Initialize secrets manager first
const { secretsManager } = require('./utils/secrets');
const { initSentry, sentryMiddleware } = require('./utils/sentry');
const { connectDB, startPerformanceMonitoring } = require('./config/database');
const { connectRedis } = require('./middleware/cache');
const errorHandler = require('./middleware/errorHandler');
const { securityHeaders, xssProtection, createRateLimiters } = require('./middleware/security');
const performanceMonitor = require('./middleware/performance');
const { logger, performanceLogger } = require('./utils/logger');
const { metricsMiddleware, getMetrics } = require('./utils/metrics');
const { apiVersioning, wrapResponse } = require('./middleware/versioning');
const alertManager = require('./utils/alerts');
const healthCheck = require('../healthcheck');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');

// Initialize app
const app = express();

// Initialize enterprise features
const initializeApp = async () => {
  try {
    // Initialize secrets manager
    await secretsManager.initialize();
    logger.info('Secrets manager initialized');

    // Initialize Sentry for error tracking
    initSentry(app);
    
    // Connect to database and Redis
    await connectDB();
    await connectRedis();
    startPerformanceMonitoring();
    
    logger.info('All services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize application', { error: error.message });
    process.exit(1);
  }
};

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Sentry request handler (must be first)
app.use(require('@sentry/node').Handlers.requestHandler());
app.use(sentryMiddleware());

// Security middleware
app.use(securityHeaders);
app.use(xssProtection);

// Compression middleware
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  threshold: 1024
}));

// API versioning
app.use('/api', apiVersioning.middleware());
app.use('/api', wrapResponse(apiVersioning));

// Performance monitoring
app.use(performanceMonitor.trackRequest());
app.use(performanceLogger);
app.use(metricsMiddleware());

// Rate limiting
const rateLimiters = createRateLimiters();
app.use('/api/v*/auth', rateLimiters.auth);
app.use('/api', rateLimiters.api);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      secretsManager.get('FRONTEND_URL'),
      'http://localhost:5173',
      'http://localhost:3000'
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept-Version']
};
app.use(cors(corsOptions));

// Body parser with size limits
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// API routes with versioning
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/users', userRoutes);

// Backward compatibility (redirect /api/* to /api/v1/*)
app.use('/api/auth', (req, res, next) => {
  req.url = `/api/v1/auth${req.url}`;
  next();
});
app.use('/api/products', (req, res, next) => {
  req.url = `/api/v1/products${req.url}`;
  next();
});
app.use('/api/cart', (req, res, next) => {
  req.url = `/api/v1/cart${req.url}`;
  next();
});
app.use('/api/orders', (req, res, next) => {
  req.url = `/api/v1/orders${req.url}`;
  next();
});
app.use('/api/users', (req, res, next) => {
  req.url = `/api/v1/users${req.url}`;
  next();
});

// Health check with detailed status
app.get('/api/health', async (req, res) => {
  try {
    const health = await healthCheck();
    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503;
    
    // Monitor health and send alerts if needed
    await alertManager.monitorHealth(health);
    
    res.status(statusCode).json(health);
  } catch (error) {
    const unhealthyStatus = {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
    
    await alertManager.monitorHealth(unhealthyStatus);
    res.status(503).json(unhealthyStatus);
  }
});

// Prometheus metrics endpoint
app.get('/api/metrics', getMetrics);

// Performance metrics endpoint
app.get('/api/performance', (req, res) => {
  const metrics = performanceMonitor.getMetrics();
  res.json({
    success: true,
    data: metrics
  });
});

// API versioning info
app.get('/api/version', (req, res) => {
  res.json({
    success: true,
    data: apiVersioning.getVersionInfo()
  });
});

// Secrets health check (admin only)
app.get('/api/secrets/health', (req, res) => {
  // This should be protected by admin authentication in production
  const health = secretsManager.getHealthStatus();
  res.json({
    success: true,
    data: health
  });
});

// Test alerts endpoint (admin only)
app.post('/api/alerts/test', async (req, res) => {
  try {
    await alertManager.testAlerts();
    res.json({
      success: true,
      message: 'Test alert sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API documentation redirect
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to KingSports API',
    documentation: '/api/docs',
    version: apiVersioning.getVersionInfo(),
    endpoints: {
      auth: '/api/v1/auth',
      products: '/api/v1/products',
      cart: '/api/v1/cart',
      orders: '/api/v1/orders',
      users: '/api/v1/users',
      health: '/api/health',
      metrics: '/api/metrics',
      performance: '/api/performance',
      version: '/api/version'
    },
    environment: process.env.NODE_ENV
  });
});

// 404 handler
app.use('*', (req, res) => {
  logger.warn('404 Not Found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Sentry error handler (must be before other error handlers)
app.use(require('@sentry/node').Handlers.errorHandler());

// Error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  await initializeApp();
  
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    logger.info(`🚀 KingSports API running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    console.log(`🚀 KingSports API running on port ${PORT}`);
  });

  // Graceful shutdown
  const gracefulShutdown = (signal) => {
    logger.info(`${signal} received. Starting graceful shutdown...`);
    
    server.close(() => {
      logger.info('HTTP server closed');
      
      // Close database connections
      require('mongoose').connection.close(() => {
        logger.info('Database connection closed');
        process.exit(0);
      });
    });
    
    // Force close after 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  // Handle shutdown signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`, { stack: err.stack });
    require('./utils/sentry').captureError(err, { type: 'unhandledRejection' });
    server.close(() => process.exit(1));
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
    require('./utils/sentry').captureError(err, { type: 'uncaughtException' });
    process.exit(1);
  });

  return server;
};

// Start the server
if (require.main === module) {
  startServer().catch(error => {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  });
}

module.exports = app;
