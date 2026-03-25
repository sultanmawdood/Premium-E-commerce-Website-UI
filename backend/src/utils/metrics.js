const client = require('prom-client');
const { logger } = require('./logger');

// Create a Registry
const register = new client.Registry();

// Add default metrics
client.collectDefaultMetrics({
  register,
  prefix: 'kingsports_api_',
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5]
});

// Custom metrics
const metrics = {
  // HTTP request metrics
  httpRequestDuration: new client.Histogram({
    name: 'kingsports_api_http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
  }),

  httpRequestsTotal: new client.Counter({
    name: 'kingsports_api_http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
  }),

  httpRequestsInFlight: new client.Gauge({
    name: 'kingsports_api_http_requests_in_flight',
    help: 'Number of HTTP requests currently being processed'
  }),

  // Business metrics
  ordersTotal: new client.Counter({
    name: 'kingsports_api_orders_total',
    help: 'Total number of orders created',
    labelNames: ['status', 'payment_method']
  }),

  orderValue: new client.Histogram({
    name: 'kingsports_api_order_value_dollars',
    help: 'Order value in dollars',
    buckets: [10, 25, 50, 100, 250, 500, 1000, 2500, 5000]
  }),

  usersTotal: new client.Counter({
    name: 'kingsports_api_users_total',
    help: 'Total number of users registered',
    labelNames: ['role']
  }),

  productsViewed: new client.Counter({
    name: 'kingsports_api_products_viewed_total',
    help: 'Total number of product views',
    labelNames: ['category', 'brand']
  }),

  cartOperations: new client.Counter({
    name: 'kingsports_api_cart_operations_total',
    help: 'Total number of cart operations',
    labelNames: ['operation'] // add, remove, update, clear
  }),

  // Authentication metrics
  authAttempts: new client.Counter({
    name: 'kingsports_api_auth_attempts_total',
    help: 'Total number of authentication attempts',
    labelNames: ['result', 'method'] // success/failure, login/register
  }),

  // Database metrics
  dbOperationDuration: new client.Histogram({
    name: 'kingsports_api_db_operation_duration_seconds',
    help: 'Duration of database operations',
    labelNames: ['operation', 'collection'],
    buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5]
  }),

  dbConnectionsActive: new client.Gauge({
    name: 'kingsports_api_db_connections_active',
    help: 'Number of active database connections'
  }),

  // Cache metrics
  cacheOperations: new client.Counter({
    name: 'kingsports_api_cache_operations_total',
    help: 'Total number of cache operations',
    labelNames: ['operation', 'result'] // get/set/del, hit/miss/success/error
  }),

  // Error metrics
  errorsTotal: new client.Counter({
    name: 'kingsports_api_errors_total',
    help: 'Total number of errors',
    labelNames: ['type', 'severity']
  }),

  // Performance metrics
  memoryUsage: new client.Gauge({
    name: 'kingsports_api_memory_usage_bytes',
    help: 'Memory usage in bytes',
    labelNames: ['type'] // heapUsed, heapTotal, external, rss
  }),

  cpuUsage: new client.Gauge({
    name: 'kingsports_api_cpu_usage_seconds',
    help: 'CPU usage in seconds',
    labelNames: ['type'] // user, system
  })
};

// Register all metrics
Object.values(metrics).forEach(metric => {
  register.registerMetric(metric);
});

// Middleware to collect HTTP metrics
const metricsMiddleware = () => {
  return (req, res, next) => {
    const start = Date.now();
    
    // Increment in-flight requests
    metrics.httpRequestsInFlight.inc();

    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000;
      const route = req.route?.path || req.path;
      const labels = {
        method: req.method,
        route,
        status_code: res.statusCode
      };

      // Record metrics
      metrics.httpRequestDuration.observe(labels, duration);
      metrics.httpRequestsTotal.inc(labels);
      metrics.httpRequestsInFlight.dec();

      // Log slow requests
      if (duration > 1) {
        logger.warn('Slow request detected', {
          method: req.method,
          route,
          duration: `${duration}s`,
          statusCode: res.statusCode
        });
      }
    });

    next();
  };
};

// Business metrics helpers
const trackOrder = (order) => {
  metrics.ordersTotal.inc({
    status: order.status,
    payment_method: order.paymentMethod
  });
  
  metrics.orderValue.observe(order.totalAmount);
  
  logger.info('Order metrics tracked', {
    orderId: order._id,
    amount: order.totalAmount,
    status: order.status
  });
};

const trackUser = (user) => {
  metrics.usersTotal.inc({
    role: user.role
  });
  
  logger.info('User metrics tracked', {
    userId: user._id,
    role: user.role
  });
};

const trackProductView = (product, category) => {
  metrics.productsViewed.inc({
    category: category || 'unknown',
    brand: product.brand || 'unknown'
  });
};

const trackCartOperation = (operation) => {
  metrics.cartOperations.inc({ operation });
};

const trackAuthAttempt = (result, method) => {
  metrics.authAttempts.inc({ result, method });
};

const trackDbOperation = (operation, collection, duration) => {
  metrics.dbOperationDuration.observe(
    { operation, collection },
    duration / 1000
  );
};

const trackCacheOperation = (operation, result) => {
  metrics.cacheOperations.inc({ operation, result });
};

const trackError = (error, severity = 'error') => {
  metrics.errorsTotal.inc({
    type: error.name || 'UnknownError',
    severity
  });
};

// System metrics updater
const updateSystemMetrics = () => {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  // Update memory metrics
  metrics.memoryUsage.set({ type: 'heapUsed' }, memUsage.heapUsed);
  metrics.memoryUsage.set({ type: 'heapTotal' }, memUsage.heapTotal);
  metrics.memoryUsage.set({ type: 'external' }, memUsage.external);
  metrics.memoryUsage.set({ type: 'rss' }, memUsage.rss);

  // Update CPU metrics
  metrics.cpuUsage.set({ type: 'user' }, cpuUsage.user / 1000000); // Convert to seconds
  metrics.cpuUsage.set({ type: 'system' }, cpuUsage.system / 1000000);
};

// Start system metrics collection
setInterval(updateSystemMetrics, 30000); // Every 30 seconds

// Metrics endpoint handler
const getMetrics = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    logger.error('Error generating metrics', { error: error.message });
    res.status(500).end('Error generating metrics');
  }
};

// Health metrics
const updateHealthMetrics = (healthData) => {
  // Update database connection metrics
  if (healthData.checks?.mongodb?.status === 'healthy') {
    metrics.dbConnectionsActive.set(1);
  } else {
    metrics.dbConnectionsActive.set(0);
  }
};

module.exports = {
  register,
  metrics,
  metricsMiddleware,
  getMetrics,
  trackOrder,
  trackUser,
  trackProductView,
  trackCartOperation,
  trackAuthAttempt,
  trackDbOperation,
  trackCacheOperation,
  trackError,
  updateHealthMetrics
};