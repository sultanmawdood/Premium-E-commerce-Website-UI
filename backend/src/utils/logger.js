const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
  })
);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');

// Daily rotate file transport for all logs
const dailyRotateFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'kingsports-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: process.env.LOG_FILE_MAX_SIZE || '20m',
  maxFiles: process.env.LOG_FILE_MAX_FILES || '14d',
  format: logFormat
});

// Daily rotate file transport for errors only
const errorRotateFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  level: 'error',
  format: logFormat
});

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { 
    service: 'kingsports-api',
    version: process.env.npm_package_version || '1.0.0'
  },
  transports: [
    dailyRotateFileTransport,
    errorRotateFileTransport
  ],
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logsDir, 'exceptions.log'),
      format: logFormat
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logsDir, 'rejections.log'),
      format: logFormat
    })
  ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Performance logging middleware
const performanceLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id || 'anonymous'
    };

    if (res.statusCode >= 400) {
      logger.warn('HTTP Request Warning', logData);
    } else {
      logger.info('HTTP Request', logData);
    }

    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow Request Detected', { ...logData, slow: true });
    }
  });

  next();
};

// Security event logger
const securityLogger = {
  loginAttempt: (email, success, ip) => {
    logger.info('Login Attempt', {
      event: 'login_attempt',
      email,
      success,
      ip,
      timestamp: new Date().toISOString()
    });
  },
  
  loginFailure: (email, ip, reason) => {
    logger.warn('Login Failure', {
      event: 'login_failure',
      email,
      ip,
      reason,
      timestamp: new Date().toISOString()
    });
  },
  
  accountLocked: (email, ip) => {
    logger.error('Account Locked', {
      event: 'account_locked',
      email,
      ip,
      timestamp: new Date().toISOString()
    });
  },
  
  suspiciousActivity: (activity, userId, ip) => {
    logger.error('Suspicious Activity', {
      event: 'suspicious_activity',
      activity,
      userId,
      ip,
      timestamp: new Date().toISOString()
    });
  }
};

// Business event logger
const businessLogger = {
  orderCreated: (orderId, userId, amount) => {
    logger.info('Order Created', {
      event: 'order_created',
      orderId,
      userId,
      amount,
      timestamp: new Date().toISOString()
    });
  },
  
  paymentProcessed: (orderId, amount, paymentMethod) => {
    logger.info('Payment Processed', {
      event: 'payment_processed',
      orderId,
      amount,
      paymentMethod,
      timestamp: new Date().toISOString()
    });
  },
  
  productViewed: (productId, userId, ip) => {
    logger.info('Product Viewed', {
      event: 'product_viewed',
      productId,
      userId: userId || 'anonymous',
      ip,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  logger,
  performanceLogger,
  securityLogger,
  businessLogger
};