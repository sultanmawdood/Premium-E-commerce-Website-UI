// Lazy load mongoose
let mongoose;

// Lazy loading function for mongoose
const getMongoose = () => {
  if (!mongoose) {
    mongoose = require('mongoose');
  }
  return mongoose;
};

// Define schema using lazy loading
const getProductSchema = () => {
  const mongooseInstance = getMongoose();
  
  const productSchema = new mongooseInstance.Schema({
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    price: {
      type: Number,
      required: [true, 'Please provide product price'],
      min: [0, 'Price cannot be negative'],
      index: true
    },
    originalPrice: {
      type: Number,
      default: 0
    },
    category: {
      type: String,
      required: [true, 'Please provide product category'],
      enum: ['men', 'women', 'shoes', 'accessories'],
      lowercase: true,
      index: true
    },
    brand: {
      type: String,
      required: [true, 'Please provide brand name'],
      trim: true,
      index: true
    },
    images: [{
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Image must be a valid URL'
      }
    }],
    colors: [{
      type: String,
      trim: true
    }],
    sizes: [{
      type: String,
      trim: true,
      uppercase: true
    }],
    stock: {
      type: Number,
      required: [true, 'Please provide stock quantity'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
      index: true
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5'],
      index: true
    },
    numReviews: {
      type: Number,
      default: 0
    },
    badge: {
      type: String,
      enum: ['', 'New', 'Sale', 'Hot', 'Limited'],
      default: ''
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    specifications: {
      type: Map,
      of: String
    },
    tags: [{
      type: String,
      trim: true
    }],
    views: {
      type: Number,
      default: 0
    },
    sales: {
      type: Number,
      default: 0
    }
  }, {
    timestamps: true
  });

  // Compound indexes for optimal query performance
  productSchema.index({ category: 1, price: 1 });
  productSchema.index({ category: 1, brand: 1 });
  productSchema.index({ category: 1, rating: -1 });
  productSchema.index({ isActive: 1, isFeatured: 1 });
  productSchema.index({ isActive: 1, createdAt: -1 });
  productSchema.index({ brand: 1, isActive: 1 });
  productSchema.index({ price: 1, rating: -1 });
  productSchema.index({ stock: 1, isActive: 1 });

  // Text index for search functionality
  productSchema.index({ 
    name: 'text', 
    description: 'text', 
    brand: 'text',
    tags: 'text'
  }, {
    weights: {
      name: 10,
      brand: 5,
      tags: 3,
      description: 1
    }
  });

  // Generate slug before saving
  productSchema.pre('save', function(next) {
    if (this.isModified('name')) {
      this.slug = this.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    next();
  });

  // Static method for advanced search
  productSchema.statics.searchProducts = function(searchTerm, filters = {}) {
    const query = { isActive: true };
    
    if (searchTerm) {
      query.$text = { $search: searchTerm };
    }
    
    // Apply filters
    Object.assign(query, filters);
    
    return this.find(query, searchTerm ? { score: { $meta: 'textScore' } } : {})
      .sort(searchTerm ? { score: { $meta: 'textScore' } } : { createdAt: -1 });
  };

  return productSchema;
};

// Export model with lazy loading
module.exports = (() => {
  let ProductModel;
  
  return () => {
    if (!ProductModel) {
      const mongooseInstance = getMongoose();
      const productSchema = getProductSchema();
      ProductModel = mongooseInstance.model('Product', productSchema);
    }
    return ProductModel;
  };
})();
