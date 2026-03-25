const http = require('http');
const mongoose = require('mongoose');
const redis = require('redis');

// Health check function
const healthCheck = async () => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    checks: {}
  };

  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState === 1) {
      health.checks.mongodb = { status: 'healthy', responseTime: 0 };
    } else {
      health.checks.mongodb = { status: 'unhealthy', error: 'Not connected' };
      health.status = 'unhealthy';
    }

    // Check Redis connection
    try {
      const redisClient = redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
      });
      
      const start = Date.now();
      await redisClient.ping();
      const responseTime = Date.now() - start;
      
      health.checks.redis = { status: 'healthy', responseTime };
      await redisClient.quit();
    } catch (error) {
      health.checks.redis = { status: 'unhealthy', error: error.message };
      health.status = 'degraded';
    }

    // Check disk space (simplified)
    const stats = require('fs').statSync('.');
    health.checks.disk = { status: 'healthy', available: true };

    // Check memory usage
    const memoryUsage = process.memoryUsage();
    const memoryThreshold = 500 * 1024 * 1024; // 500MB
    
    if (memoryUsage.heapUsed > memoryThreshold) {
      health.checks.memory = { 
        status: 'warning', 
        heapUsed: memoryUsage.heapUsed,
        threshold: memoryThreshold
      };
      if (health.status === 'healthy') health.status = 'degraded';
    } else {
      health.checks.memory = { status: 'healthy', heapUsed: memoryUsage.heapUsed };
    }

  } catch (error) {
    health.status = 'unhealthy';
    health.error = error.message;
  }

  return health;
};

// Standalone health check for Docker
if (require.main === module) {
  const options = {
    hostname: 'localhost',
    port: process.env.PORT || 5000,
    path: '/api/health',
    method: 'GET',
    timeout: 2000
  };

  const req = http.request(options, (res) => {
    if (res.statusCode === 200) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  });

  req.on('error', () => {
    process.exit(1);
  });

  req.on('timeout', () => {
    req.destroy();
    process.exit(1);
  });

  req.end();
}

module.exports = healthCheck;