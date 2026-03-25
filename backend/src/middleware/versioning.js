const { logger } = require('../utils/logger');

class ApiVersioning {
  constructor() {
    this.supportedVersions = ['v1', 'v2'];
    this.defaultVersion = 'v1';
    this.deprecatedVersions = new Map([
      // ['v1', { deprecatedAt: '2024-01-01', sunsetAt: '2024-06-01' }]
    ]);
  }

  // Extract version from request
  extractVersion(req) {
    // Priority order: header > query > URL path > default
    let version = null;

    // 1. Check Accept-Version header
    if (req.headers['accept-version']) {
      version = req.headers['accept-version'];
    }
    
    // 2. Check version query parameter
    else if (req.query.version) {
      version = req.query.version;
    }
    
    // 3. Check URL path (/api/v1/...)
    else {
      const pathMatch = req.path.match(/^\/api\/(v\d+)\//);
      if (pathMatch) {
        version = pathMatch[1];
      }
    }

    // 4. Use default version
    if (!version) {
      version = this.defaultVersion;
    }

    return version;
  }

  // Validate version
  isValidVersion(version) {
    return this.supportedVersions.includes(version);
  }

  // Check if version is deprecated
  isDeprecated(version) {
    return this.deprecatedVersions.has(version);
  }

  // Get deprecation info
  getDeprecationInfo(version) {
    return this.deprecatedVersions.get(version);
  }

  // Middleware for version handling
  middleware() {
    return (req, res, next) => {
      const version = this.extractVersion(req);

      // Validate version
      if (!this.isValidVersion(version)) {
        return res.status(400).json({
          success: false,
          error: 'Unsupported API version',
          message: `Version '${version}' is not supported. Supported versions: ${this.supportedVersions.join(', ')}`,
          supportedVersions: this.supportedVersions
        });
      }

      // Set version in request
      req.apiVersion = version;

      // Add version headers to response
      res.set('API-Version', version);
      res.set('Supported-Versions', this.supportedVersions.join(', '));

      // Handle deprecated versions
      if (this.isDeprecated(version)) {
        const deprecationInfo = this.getDeprecationInfo(version);
        
        res.set('Deprecation', deprecationInfo.deprecatedAt);
        res.set('Sunset', deprecationInfo.sunsetAt);
        res.set('Warning', `299 - "API version ${version} is deprecated. Please migrate to a newer version."`);

        logger.warn('Deprecated API version used', {
          version,
          path: req.path,
          userAgent: req.get('User-Agent'),
          ip: req.ip,
          deprecationInfo
        });
      }

      // Log version usage
      logger.info('API version used', {
        version,
        path: req.path,
        method: req.method,
        userAgent: req.get('User-Agent')
      });

      next();
    };
  }

  // Version-specific route handler
  versionedRoute(handlers) {
    return (req, res, next) => {
      const version = req.apiVersion || this.defaultVersion;
      const handler = handlers[version] || handlers[this.defaultVersion];

      if (!handler) {
        return res.status(501).json({
          success: false,
          error: 'Not implemented',
          message: `This endpoint is not implemented for version ${version}`
        });
      }

      // Call the version-specific handler
      handler(req, res, next);
    };
  }

  // Response transformer for different versions
  transformResponse(data, version) {
    const transformers = {
      v1: (data) => {
        // V1 response format
        return {
          success: true,
          data: data,
          timestamp: new Date().toISOString()
        };
      },
      
      v2: (data) => {
        // V2 response format with additional metadata
        return {
          success: true,
          result: data,
          meta: {
            version: 'v2',
            timestamp: new Date().toISOString(),
            requestId: Math.random().toString(36).substr(2, 9)
          }
        };
      }
    };

    const transformer = transformers[version] || transformers[this.defaultVersion];
    return transformer(data);
  }

  // Backward compatibility helper
  ensureBackwardCompatibility(req, res, next) {
    const version = req.apiVersion;

    // V1 compatibility adjustments
    if (version === 'v1') {
      // Transform request for backward compatibility
      if (req.body && req.body.newField) {
        req.body.oldField = req.body.newField;
        delete req.body.newField;
      }
    }

    next();
  }

  // Version migration helper
  getMigrationGuide(fromVersion, toVersion) {
    const migrations = {
      'v1-to-v2': {
        breaking_changes: [
          'Response format changed from `data` to `result`',
          'Error responses now include `error_code` field',
          'Date formats changed to ISO 8601'
        ],
        new_features: [
          'Added request tracking with `requestId`',
          'Enhanced error details',
          'New pagination format'
        ],
        migration_steps: [
          'Update response parsing to use `result` instead of `data`',
          'Handle new error format with `error_code`',
          'Update date parsing for ISO 8601 format'
        ]
      }
    };

    const key = `${fromVersion}-to-${toVersion}`;
    return migrations[key] || null;
  }

  // API documentation endpoint
  getVersionInfo() {
    return {
      current_version: this.defaultVersion,
      supported_versions: this.supportedVersions,
      deprecated_versions: Array.from(this.deprecatedVersions.entries()).map(([version, info]) => ({
        version,
        ...info
      })),
      version_selection: {
        methods: [
          'Accept-Version header (recommended)',
          'version query parameter',
          'URL path (/api/v1/...)',
          'Default version if none specified'
        ],
        examples: {
          header: 'Accept-Version: v2',
          query: '?version=v2',
          path: '/api/v2/products'
        }
      }
    };
  }
}

// Version-specific middleware for different endpoints
const createVersionedMiddleware = (apiVersioning) => {
  return {
    // Products endpoint versions
    getProducts: apiVersioning.versionedRoute({
      v1: require('../controllers/v1/productController').getProducts,
      v2: require('../controllers/v2/productController').getProducts
    }),

    // Users endpoint versions
    getUsers: apiVersioning.versionedRoute({
      v1: require('../controllers/v1/userController').getUsers,
      v2: require('../controllers/v2/userController').getUsers
    }),

    // Orders endpoint versions
    createOrder: apiVersioning.versionedRoute({
      v1: require('../controllers/v1/orderController').createOrder,
      v2: require('../controllers/v2/orderController').createOrder
    })
  };
};

// Response wrapper for consistent API responses
const wrapResponse = (apiVersioning) => {
  return (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      const version = req.apiVersion || apiVersioning.defaultVersion;
      const transformedData = apiVersioning.transformResponse(data, version);
      
      return originalJson.call(this, transformedData);
    };
    
    next();
  };
};

// Create singleton instance
const apiVersioning = new ApiVersioning();

module.exports = {
  ApiVersioning,
  apiVersioning,
  createVersionedMiddleware,
  wrapResponse
};