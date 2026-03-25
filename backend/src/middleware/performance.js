const { logger } = require('../utils/logger');

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      totalResponseTime: 0,
      slowRequests: 0,
      memoryLeaks: 0
    };
    
    this.startTime = Date.now();
    this.requestTimes = [];
    
    // Start monitoring intervals
    this.startMemoryMonitoring();
    this.startMetricsReporting();
  }

  // Middleware for tracking request performance
  trackRequest() {
    return (req, res, next) => {
      const startTime = Date.now();
      const startMemory = process.memoryUsage();

      // Track request count
      this.metrics.requests++;

      res.on('finish', () => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        const endMemory = process.memoryUsage();

        // Update metrics
        this.metrics.totalResponseTime += responseTime;
        this.requestTimes.push(responseTime);

        // Keep only last 1000 request times
        if (this.requestTimes.length > 1000) {
          this.requestTimes.shift();
        }

        // Track slow requests (>1000ms)
        if (responseTime > 1000) {
          this.metrics.slowRequests++;
          logger.warn('Slow Request Detected', {
            url: req.originalUrl,
            method: req.method,
            responseTime: `${responseTime}ms`,
            statusCode: res.statusCode
          });
        }

        // Track errors
        if (res.statusCode >= 400) {
          this.metrics.errors++;
        }

        // Memory usage tracking
        const memoryDiff = endMemory.heapUsed - startMemory.heapUsed;
        if (memoryDiff > 10 * 1024 * 1024) { // 10MB increase
          logger.warn('High Memory Usage Request', {
            url: req.originalUrl,
            memoryIncrease: `${Math.round(memoryDiff / 1024 / 1024)}MB`,
            totalHeapUsed: `${Math.round(endMemory.heapUsed / 1024 / 1024)}MB`
          });
        }

        // Log request details
        logger.info('Request Completed', {
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          responseTime: `${responseTime}ms`,
          userAgent: req.get('User-Agent'),
          ip: req.ip
        });
      });

      next();
    };
  }

  // Get current performance metrics
  getMetrics() {
    const uptime = Date.now() - this.startTime;
    const avgResponseTime = this.metrics.requests > 0 
      ? this.metrics.totalResponseTime / this.metrics.requests 
      : 0;

    const p95ResponseTime = this.calculatePercentile(this.requestTimes, 95);
    const p99ResponseTime = this.calculatePercentile(this.requestTimes, 99);

    return {
      uptime: Math.floor(uptime / 1000), // seconds
      requests: {
        total: this.metrics.requests,
        errors: this.metrics.errors,
        errorRate: this.metrics.requests > 0 
          ? (this.metrics.errors / this.metrics.requests * 100).toFixed(2) + '%'
          : '0%',
        slowRequests: this.metrics.slowRequests
      },
      responseTime: {
        average: Math.round(avgResponseTime),
        p95: Math.round(p95ResponseTime),
        p99: Math.round(p99ResponseTime)
      },
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };
  }

  // Calculate percentile for response times
  calculatePercentile(arr, percentile) {
    if (arr.length === 0) return 0;
    
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  // Monitor memory usage for leaks
  startMemoryMonitoring() {
    setInterval(() => {
      const memUsage = process.memoryUsage();
      const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      
      // Alert if memory usage is high
      if (heapUsedMB > 500) { // 500MB threshold
        logger.warn('High Memory Usage Detected', {
          heapUsed: `${heapUsedMB}MB`,
          heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
          external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
        });
      }

      // Force garbage collection if available
      if (global.gc && heapUsedMB > 400) {
        global.gc();
        logger.info('Garbage Collection Triggered', {
          beforeGC: `${heapUsedMB}MB`,
          afterGC: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
        });
      }
    }, 60000); // Check every minute
  }

  // Report metrics periodically
  startMetricsReporting() {
    setInterval(() => {
      const metrics = this.getMetrics();
      logger.info('Performance Metrics', metrics);
    }, 300000); // Report every 5 minutes
  }

  // Reset metrics (useful for testing)
  reset() {
    this.metrics = {
      requests: 0,
      errors: 0,
      totalResponseTime: 0,
      slowRequests: 0,
      memoryLeaks: 0
    };
    this.requestTimes = [];
    this.startTime = Date.now();
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

module.exports = performanceMonitor;