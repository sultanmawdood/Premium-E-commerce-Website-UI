const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');
const { logger } = require('./logger');

// Initialize Sentry
const initSentry = (app) => {
  if (!process.env.SENTRY_DSN) {
    logger.warn('Sentry DSN not configured, error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.npm_package_version || '1.0.0',
    
    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    integrations: [
      // Enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // Enable Express.js middleware tracing
      new Sentry.Integrations.Express({ app }),
      // Enable profiling
      new ProfilingIntegration(),
      // Enable MongoDB tracing
      new Sentry.Integrations.Mongo({
        useMongoose: true
      }),
      // Enable Redis tracing
      new Sentry.Integrations.Redis()
    ],

    // Custom error filtering
    beforeSend(event, hint) {
      const error = hint.originalException;
      
      // Don't send validation errors to Sentry
      if (error && error.name === 'ValidationError') {
        return null;
      }
      
      // Don't send 404 errors
      if (event.exception) {
        const exc = event.exception.values[0];
        if (exc && exc.type === 'NotFoundError') {
          return null;
        }
      }
      
      return event;
    },

    // Custom tags
    initialScope: {
      tags: {
        component: 'kingsports-api',
        server: process.env.SERVER_NAME || 'unknown'
      }
    }
  });

  logger.info('Sentry initialized successfully', {
    environment: process.env.NODE_ENV,
    release: process.env.npm_package_version
  });
};

// Custom error context
const addErrorContext = (user, extra = {}) => {
  Sentry.configureScope((scope) => {
    if (user) {
      scope.setUser({
        id: user.id,
        email: user.email,
        role: user.role
      });
    }
    
    Object.keys(extra).forEach(key => {
      scope.setExtra(key, extra[key]);
    });
  });
};

// Custom error capture
const captureError = (error, context = {}) => {
  logger.error('Error captured by Sentry', {
    error: error.message,
    stack: error.stack,
    context
  });
  
  return Sentry.captureException(error, {
    extra: context
  });
};

// Performance monitoring
const startTransaction = (name, op = 'http') => {
  return Sentry.startTransaction({
    name,
    op
  });
};

// Custom middleware for request tracking
const sentryMiddleware = () => {
  return (req, res, next) => {
    const transaction = Sentry.startTransaction({
      op: 'http',
      name: `${req.method} ${req.route?.path || req.path}`
    });

    // Add request context
    Sentry.configureScope((scope) => {
      scope.setSpan(transaction);
      scope.setTag('method', req.method);
      scope.setTag('url', req.originalUrl);
      scope.setExtra('headers', req.headers);
      scope.setExtra('query', req.query);
      scope.setExtra('body', req.body);
    });

    res.on('finish', () => {
      transaction.setHttpStatus(res.statusCode);
      transaction.finish();
    });

    next();
  };
};

// Business logic error tracking
const trackBusinessEvent = (event, data = {}) => {
  Sentry.addBreadcrumb({
    message: event,
    category: 'business',
    level: 'info',
    data
  });
};

module.exports = {
  initSentry,
  addErrorContext,
  captureError,
  startTransaction,
  sentryMiddleware,
  trackBusinessEvent,
  Sentry
};