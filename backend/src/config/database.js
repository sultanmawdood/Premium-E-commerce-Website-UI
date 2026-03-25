const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

// Connection options for production
const getConnectionOptions = () => ({
  // Connection pool settings
  maxPoolSize: 10, // Maximum number of connections
  minPoolSize: 2,  // Minimum number of connections
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  serverSelectionTimeoutMS: 5000, // How long to try selecting a server
  socketTimeoutMS: 45000, // How long a send or receive on a socket can take
  
  // Buffering settings
  bufferMaxEntries: 0, // Disable mongoose buffering
  bufferCommands: false, // Disable mongoose buffering
  
  // Authentication
  authSource: 'admin',
  
  // Write concern for production
  writeConcern: {
    w: 'majority',
    j: true, // Wait for journal
    wtimeout: 5000
  },
  
  // Read preference
  readPreference: 'primary',
  
  // Compression
  compressors: ['zlib'],
  
  // SSL/TLS for production
  ssl: process.env.NODE_ENV === 'production',
  sslValidate: process.env.NODE_ENV === 'production',
  
  // Monitoring
  monitorCommands: true
});

// Connection state tracking
let connectionState = {
  isConnected: false,
  isConnecting: false,
  connectionAttempts: 0,
  lastConnectionTime: null,
  lastError: null
};

// Connect to MongoDB with retry logic
const connectDB = async (retries = 5) => {
  if (connectionState.isConnected) {
    logger.info('Database already connected');
    return;
  }

  if (connectionState.isConnecting) {
    logger.info('Database connection already in progress');
    return;
  }

  connectionState.isConnecting = true;
  connectionState.connectionAttempts++;

  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    logger.info(`Attempting to connect to MongoDB (attempt ${connectionState.connectionAttempts})`);

    const options = getConnectionOptions();
    
    await mongoose.connect(mongoURI, options);
    
    connectionState.isConnected = true;
    connectionState.isConnecting = false;
    connectionState.lastConnectionTime = new Date();
    connectionState.lastError = null;
    
    logger.info('MongoDB connected successfully', {
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      database: mongoose.connection.name,
      readyState: mongoose.connection.readyState
    });

  } catch (error) {
    connectionState.isConnecting = false;
    connectionState.lastError = error;
    
    logger.error('MongoDB connection failed', {
      error: error.message,
      attempt: connectionState.connectionAttempts,
      retriesLeft: retries - 1
    });

    if (retries > 1) {
      const delay = Math.min(1000 * Math.pow(2, connectionState.connectionAttempts - 1), 30000);
      logger.info(`Retrying connection in ${delay}ms...`);
      
      setTimeout(() => {
        connectDB(retries - 1);
      }, delay);
    } else {
      logger.error('All connection attempts failed. Exiting...');
      process.exit(1);
    }
  }
};

// Connection event handlers
mongoose.connection.on('connected', () => {
  connectionState.isConnected = true;
  logger.info('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  connectionState.lastError = err;
  logger.error('Mongoose connection error', { error: err.message });
});

mongoose.connection.on('disconnected', () => {
  connectionState.isConnected = false;
  logger.warn('Mongoose disconnected from MongoDB');
  
  // Attempt to reconnect
  if (process.env.NODE_ENV === 'production') {
    setTimeout(() => {
      logger.info('Attempting to reconnect to MongoDB...');
      connectDB();
    }, 5000);
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    logger.error('Error during MongoDB disconnection', { error: error.message });
    process.exit(1);
  }
});

// Health check function
const getConnectionHealth = () => {
  const state = mongoose.connection.readyState;
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  return {
    status: stateMap[state] || 'unknown',
    readyState: state,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    database: mongoose.connection.name,
    connectionAttempts: connectionState.connectionAttempts,
    lastConnectionTime: connectionState.lastConnectionTime,
    lastError: connectionState.lastError?.message || null
  };
};

// Database performance monitoring
const startPerformanceMonitoring = () => {
  if (process.env.NODE_ENV !== 'production') return;

  // Monitor slow queries
  mongoose.set('debug', (collectionName, method, query, doc) => {
    const start = Date.now();
    
    // Log slow queries (>100ms)
    setTimeout(() => {
      const duration = Date.now() - start;
      if (duration > 100) {
        logger.warn('Slow Database Query', {
          collection: collectionName,
          method,
          query: JSON.stringify(query),
          duration: `${duration}ms`
        });
      }
    }, 0);
  });

  // Monitor connection pool
  setInterval(() => {
    const poolStats = {
      totalConnections: mongoose.connection.db?.serverConfig?.connections?.length || 0,
      availableConnections: mongoose.connection.db?.serverConfig?.availableConnections?.length || 0,
      checkedOutConnections: mongoose.connection.db?.serverConfig?.checkedOutConnections?.length || 0
    };

    logger.info('Database Connection Pool Stats', poolStats);
  }, 300000); // Every 5 minutes
};

// Backup configuration
const createBackupScript = () => {
  const backupScript = `#!/bin/bash
# MongoDB Backup Script for KingSports
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups/mongodb"
DB_NAME="kingsports"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
mongodump --uri="${process.env.MONGODB_URI}" --out $BACKUP_DIR/backup_$DATE

# Compress backup
tar -czf $BACKUP_DIR/kingsports_backup_$DATE.tar.gz -C $BACKUP_DIR backup_$DATE

# Remove uncompressed backup
rm -rf $BACKUP_DIR/backup_$DATE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: kingsports_backup_$DATE.tar.gz"
`;

  return backupScript;
};

module.exports = {
  connectDB,
  getConnectionHealth,
  startPerformanceMonitoring,
  createBackupScript
};