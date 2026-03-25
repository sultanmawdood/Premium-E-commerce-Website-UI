const redis = require('redis');
const logger = require('../utils/logger');

// Redis client setup
let redisClient;

const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3
    });

    await redisClient.connect();
    logger.info('Redis connected successfully');
  } catch (error) {
    logger.error('Redis connection failed:', error);
    redisClient = null;
  }
};

// Cache middleware
const cache = (duration = 300) => {
  return async (req, res, next) => {
    if (!redisClient) return next();

    const key = `cache:${req.originalUrl}`;
    
    try {
      const cached = await redisClient.get(key);
      
      if (cached) {
        return res.json(JSON.parse(cached));
      }

      // Store original json method
      const originalJson = res.json;
      
      // Override json method to cache response
      res.json = function(data) {
        // Cache successful responses only
        if (res.statusCode === 200 && data.success) {
          redisClient.setEx(key, duration, JSON.stringify(data))
            .catch(err => logger.error('Cache set error:', err));
        }
        
        // Call original json method
        originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

// Clear cache by pattern
const clearCache = async (pattern) => {
  if (!redisClient) return;
  
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      logger.info(`Cleared ${keys.length} cache entries`);
    }
  } catch (error) {
    logger.error('Cache clear error:', error);
  }
};

// Cache invalidation middleware
const invalidateCache = (patterns) => {
  return async (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      // Clear cache on successful mutations
      if (res.statusCode < 300 && data.success) {
        patterns.forEach(pattern => clearCache(pattern));
      }
      
      originalJson.call(this, data);
    };
    
    next();
  };
};

module.exports = {
  connectRedis,
  cache,
  clearCache,
  invalidateCache,
  redisClient: () => redisClient
};