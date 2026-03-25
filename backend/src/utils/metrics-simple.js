const client = require('prom-client');
const { logger } = require('./logger');

// Create a Registry
const register = new client.Registry();

// Add default metrics
client.collectDefaultMetrics({
  register,
  prefix: 'kingsports_api_'
});

// Custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'kingsports_api_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const httpRequestsTotal = new client.Counter({
  name: 'kingsports_api_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const ordersTotal = new client.Counter({
  name: 'kingsports_api_orders_total',
  help: 'Total number of orders created',
  labelNames: ['status']
});

// Register metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(ordersTotal);

// Simple middleware
const metricsMiddleware = () => {
  return (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000;
      const labels = {
        method: req.method,
        route: req.route?.path || req.path,
        status_code: res.statusCode
      };

      httpRequestDuration.observe(labels, duration);
      httpRequestsTotal.inc(labels);
    });

    next();
  };
};

// Metrics endpoint
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

// Business metrics
const trackOrder = (order) => {
  ordersTotal.inc({ status: order.status });
};

module.exports = {
  register,
  metricsMiddleware,
  getMetrics,
  trackOrder
};