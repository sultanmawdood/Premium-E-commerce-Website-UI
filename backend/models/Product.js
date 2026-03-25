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
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative']
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      enum: ['men', 'women', 'shoes', 'accessories'],
      lowercase: true
    },
    brand: {
      type: String,
      required: [true, 'Product brand is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    colors: [{
      type: String,
      trim: true
    }],
    sizes: [{
      type: String,
      trim: true,
      uppercase: true
    }],
    image: {
      type: String,
      required: [true, 'Product image is required'],
      validate: {
        validator: function(v) {
          return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(v);
        },
        message: 'Please provide a valid image URL'
      }
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative']
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }, {
    timestamps: true
  });

  // Index for better query performance
  productSchema.index({ category: 1, brand: 1 });
  productSchema.index({ name: 'text', description: 'text' });

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