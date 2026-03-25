const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const { logger } = require('./logger');

class SecretsManager {
  constructor() {
    this.secrets = new Map();
    this.encryptionKey = null;
    this.secretsPath = process.env.SECRETS_PATH || '/run/secrets';
    this.encryptedSecretsPath = process.env.ENCRYPTED_SECRETS_PATH || './secrets.enc';
    this.initialized = false;
  }

  // Initialize secrets manager
  async initialize() {
    try {
      // Try to load from Docker secrets first
      if (await this.loadDockerSecrets()) {
        logger.info('Secrets loaded from Docker secrets');
      }
      // Fallback to encrypted file
      else if (await this.loadEncryptedSecrets()) {
        logger.info('Secrets loaded from encrypted file');
      }
      // Fallback to environment variables (least secure)
      else {
        this.loadEnvironmentSecrets();
        logger.warn('Secrets loaded from environment variables (not recommended for production)');
      }

      this.initialized = true;
      this.validateRequiredSecrets();
      
      logger.info('Secrets manager initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize secrets manager', { error: error.message });
      throw error;
    }
  }

  // Load secrets from Docker secrets
  async loadDockerSecrets() {
    try {
      const secretFiles = [
        'mongodb_uri',
        'jwt_secret',
        'jwt_refresh_secret',
        'redis_password',
        'stripe_secret_key',
        'sentry_dsn',
        'smtp_password'
      ];

      let loadedCount = 0;
      
      for (const secretFile of secretFiles) {
        try {
          const secretPath = path.join(this.secretsPath, secretFile);
          const secretValue = await fs.readFile(secretPath, 'utf8');
          
          // Convert filename to environment variable format
          const envKey = secretFile.toUpperCase();
          this.secrets.set(envKey, secretValue.trim());
          loadedCount++;
        } catch (error) {
          // Secret file doesn't exist, continue
          continue;
        }
      }

      return loadedCount > 0;
    } catch (error) {
      logger.debug('Docker secrets not available', { error: error.message });
      return false;
    }
  }

  // Load secrets from encrypted file
  async loadEncryptedSecrets() {
    try {
      const encryptionKey = process.env.SECRETS_ENCRYPTION_KEY;
      if (!encryptionKey) {
        logger.debug('No encryption key provided for encrypted secrets');
        return false;
      }

      const encryptedData = await fs.readFile(this.encryptedSecretsPath, 'utf8');
      const decryptedData = this.decrypt(encryptedData, encryptionKey);
      const secrets = JSON.parse(decryptedData);

      Object.entries(secrets).forEach(([key, value]) => {
        this.secrets.set(key, value);
      });

      return true;
    } catch (error) {
      logger.debug('Encrypted secrets file not available', { error: error.message });
      return false;
    }
  }

  // Load secrets from environment variables
  loadEnvironmentSecrets() {
    const secretKeys = [
      'MONGODB_URI',
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'REDIS_PASSWORD',
      'STRIPE_SECRET_KEY',
      'SENTRY_DSN',
      'SMTP_PASSWORD',
      'TELEGRAM_BOT_TOKEN',
      'CLOUDINARY_API_SECRET'
    ];

    secretKeys.forEach(key => {
      const value = process.env[key];
      if (value) {
        this.secrets.set(key, value);
      }
    });
  }

  // Get secret value
  get(key) {
    if (!this.initialized) {
      throw new Error('Secrets manager not initialized');
    }

    const secret = this.secrets.get(key);
    if (!secret) {
      logger.warn(`Secret '${key}' not found`);
      return null;
    }

    // Log secret access (without value)
    logger.debug('Secret accessed', { key, hasValue: !!secret });
    
    return secret;
  }

  // Set secret value (for testing or dynamic secrets)
  set(key, value) {
    if (!value) {
      throw new Error('Secret value cannot be empty');
    }

    this.secrets.set(key, value);
    logger.info('Secret updated', { key });
  }

  // Check if secret exists
  has(key) {
    return this.secrets.has(key);
  }

  // Validate required secrets
  validateRequiredSecrets() {
    const requiredSecrets = [
      'MONGODB_URI',
      'JWT_SECRET',
      'JWT_REFRESH_SECRET'
    ];

    const missingSecrets = requiredSecrets.filter(key => !this.has(key));
    
    if (missingSecrets.length > 0) {
      throw new Error(`Missing required secrets: ${missingSecrets.join(', ')}`);
    }

    // Validate secret strength
    this.validateSecretStrength('JWT_SECRET', 32);
    this.validateSecretStrength('JWT_REFRESH_SECRET', 32);
  }

  // Validate secret strength
  validateSecretStrength(key, minLength) {
    const secret = this.get(key);
    if (!secret || secret.length < minLength) {
      throw new Error(`Secret '${key}' must be at least ${minLength} characters long`);
    }
  }

  // Encrypt data
  encrypt(data, key) {
    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  // Decrypt data
  decrypt(encryptedData, key) {
    const algorithm = 'aes-256-gcm';
    const { encrypted, iv, authTag } = JSON.parse(encryptedData);
    
    const decipher = crypto.createDecipher(algorithm, key);
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // Create encrypted secrets file
  async createEncryptedSecretsFile(secrets, encryptionKey) {
    try {
      const data = JSON.stringify(secrets, null, 2);
      const encrypted = this.encrypt(data, encryptionKey);
      
      await fs.writeFile(this.encryptedSecretsPath, JSON.stringify(encrypted));
      logger.info('Encrypted secrets file created');
    } catch (error) {
      logger.error('Failed to create encrypted secrets file', { error: error.message });
      throw error;
    }
  }

  // Rotate secrets (for security)
  async rotateSecret(key, newValue) {
    if (!this.has(key)) {
      throw new Error(`Secret '${key}' does not exist`);
    }

    const oldValue = this.get(key);
    this.set(key, newValue);

    logger.info('Secret rotated', { 
      key, 
      rotatedAt: new Date().toISOString() 
    });

    // Return old value for cleanup purposes
    return oldValue;
  }

  // Get secrets health status
  getHealthStatus() {
    const requiredSecrets = [
      'MONGODB_URI',
      'JWT_SECRET',
      'JWT_REFRESH_SECRET'
    ];

    const optionalSecrets = [
      'REDIS_PASSWORD',
      'STRIPE_SECRET_KEY',
      'SENTRY_DSN',
      'SMTP_PASSWORD'
    ];

    const status = {
      initialized: this.initialized,
      requiredSecrets: {},
      optionalSecrets: {},
      totalSecrets: this.secrets.size
    };

    requiredSecrets.forEach(key => {
      status.requiredSecrets[key] = this.has(key);
    });

    optionalSecrets.forEach(key => {
      status.optionalSecrets[key] = this.has(key);
    });

    return status;
  }

  // Clear all secrets (for testing)
  clear() {
    this.secrets.clear();
    this.initialized = false;
    logger.info('All secrets cleared');
  }

  // Export secrets for backup (encrypted)
  async exportSecrets(encryptionKey) {
    if (!this.initialized) {
      throw new Error('Secrets manager not initialized');
    }

    const secretsObj = {};
    this.secrets.forEach((value, key) => {
      secretsObj[key] = value;
    });

    const encrypted = this.encrypt(JSON.stringify(secretsObj), encryptionKey);
    
    logger.info('Secrets exported', { 
      count: this.secrets.size,
      exportedAt: new Date().toISOString()
    });

    return JSON.stringify(encrypted);
  }

  // Import secrets from backup
  async importSecrets(encryptedData, encryptionKey) {
    try {
      const decryptedData = this.decrypt(encryptedData, encryptionKey);
      const secrets = JSON.parse(decryptedData);

      Object.entries(secrets).forEach(([key, value]) => {
        this.secrets.set(key, value);
      });

      this.initialized = true;
      this.validateRequiredSecrets();

      logger.info('Secrets imported', { 
        count: Object.keys(secrets).length,
        importedAt: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Failed to import secrets', { error: error.message });
      throw error;
    }
  }
}

// Create singleton instance
const secretsManager = new SecretsManager();

// Helper functions for easy access
const getSecret = (key) => secretsManager.get(key);
const hasSecret = (key) => secretsManager.has(key);
const setSecret = (key, value) => secretsManager.set(key, value);

module.exports = {
  SecretsManager,
  secretsManager,
  getSecret,
  hasSecret,
  setSecret
};