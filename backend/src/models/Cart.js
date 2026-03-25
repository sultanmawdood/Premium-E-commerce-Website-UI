// Lazy load mongoose
let mongoose;

// Lazy loading function for mongoose
const getMongoose = () => {
  if (!mongoose) {
    mongoose = require('mongoose');
  }
  return mongoose;
};

// Define schemas using lazy loading
const getCartItemSchema = () => {
  const mongooseInstance = getMongoose();
  
  return new mongooseInstance.Schema({
    product: {
      type: mongooseInstance.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1
    },
    size: {
      type: String,
      required: true
    },
    color: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  });
};

const getCartSchema = () => {
  const mongooseInstance = getMongoose();
  const cartItemSchema = getCartItemSchema();
  
  const cartSchema = new mongooseInstance.Schema({
    user: {
      type: mongooseInstance.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    items: [cartItemSchema],
    totalPrice: {
      type: Number,
      default: 0
    }
  }, {
    timestamps: true
  });

  // Calculate total price before saving
  cartSchema.pre('save', function(next) {
    this.totalPrice = this.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
    next();
  });

  return cartSchema;
};

// Export model with lazy loading
module.exports = (() => {
  let CartModel;
  
  return () => {
    if (!CartModel) {
      const mongooseInstance = getMongoose();
      const cartSchema = getCartSchema();
      CartModel = mongooseInstance.model('Cart', cartSchema);
    }
    return CartModel;
  };
})();
