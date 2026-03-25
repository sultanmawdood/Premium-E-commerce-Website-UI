// MongoDB initialization script for production
db = db.getSiblingDB('kingsports');

// Create application user with specific permissions
db.createUser({
  user: 'kingsports_app',
  pwd: process.env.MONGO_APP_PASSWORD || 'change_this_password',
  roles: [
    {
      role: 'readWrite',
      db: 'kingsports'
    }
  ]
});

// Create read-only user for analytics/reporting
db.createUser({
  user: 'kingsports_readonly',
  pwd: process.env.MONGO_READONLY_PASSWORD || 'change_this_readonly_password',
  roles: [
    {
      role: 'read',
      db: 'kingsports'
    }
  ]
});

// Create indexes for optimal performance
print('Creating indexes...');

// User collection indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "isActive": 1 });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "createdAt": -1 });
db.users.createIndex({ "resetPasswordToken": 1 }, { sparse: true });

// Product collection indexes
db.products.createIndex({ "name": "text", "description": "text", "brand": "text", "tags": "text" });
db.products.createIndex({ "category": 1, "price": 1 });
db.products.createIndex({ "category": 1, "brand": 1 });
db.products.createIndex({ "category": 1, "rating": -1 });
db.products.createIndex({ "isActive": 1, "isFeatured": 1 });
db.products.createIndex({ "isActive": 1, "createdAt": -1 });
db.products.createIndex({ "brand": 1, "isActive": 1 });
db.products.createIndex({ "price": 1, "rating": -1 });
db.products.createIndex({ "stock": 1, "isActive": 1 });
db.products.createIndex({ "slug": 1 }, { unique: true });

// Order collection indexes
db.orders.createIndex({ "user": 1, "createdAt": -1 });
db.orders.createIndex({ "status": 1 });
db.orders.createIndex({ "createdAt": -1 });
db.orders.createIndex({ "paymentStatus": 1 });
db.orders.createIndex({ "orderNumber": 1 }, { unique: true });

// Cart collection indexes
db.carts.createIndex({ "user": 1 }, { unique: true });
db.carts.createIndex({ "items.product": 1 });
db.carts.createIndex({ "updatedAt": -1 });

// Review collection indexes
db.reviews.createIndex({ "product": 1, "user": 1 }, { unique: true });
db.reviews.createIndex({ "product": 1, "rating": -1 });
db.reviews.createIndex({ "user": 1, "createdAt": -1 });
db.reviews.createIndex({ "verified": 1 });

// Wishlist collection indexes
db.wishlists.createIndex({ "user": 1 }, { unique: true });
db.wishlists.createIndex({ "items.product": 1 });

print('Indexes created successfully');

// Set up TTL indexes for temporary data
db.sessions.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });
db.passwordResets.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });

print('TTL indexes created successfully');

// Create collections with validation rules
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email", "password"],
      properties: {
        name: {
          bsonType: "string",
          maxLength: 50
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
        },
        role: {
          enum: ["user", "admin", "moderator"]
        }
      }
    }
  }
});

db.createCollection("products", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "description", "price", "category", "brand"],
      properties: {
        name: {
          bsonType: "string",
          maxLength: 200
        },
        price: {
          bsonType: "number",
          minimum: 0
        },
        category: {
          enum: ["men", "women", "shoes", "accessories"]
        },
        stock: {
          bsonType: "number",
          minimum: 0
        },
        rating: {
          bsonType: "number",
          minimum: 0,
          maximum: 5
        }
      }
    }
  }
});

print('Collections with validation created successfully');
print('MongoDB initialization completed');