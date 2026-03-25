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
const getOrderItemSchema = () => {
  const mongooseInstance = getMongoose();
  
  return new mongooseInstance.Schema({
    product: {
      type: mongooseInstance.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    size: {
      type: String,
      required: true
    },
    color: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  });
};

const getOrderSchema = () => {
  const mongooseInstance = getMongoose();
  const orderItemSchema = getOrderItemSchema();
  
  const orderSchema = new mongooseInstance.Schema({
    user: {
      type: mongooseInstance.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true
    },
    items: [orderItemSchema],
    shippingAddress: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true }
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['card', 'paypal'],
      default: 'card'
    },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    promoCode: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false
    },
    paidAt: {
      type: Date
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false
    },
    deliveredAt: {
      type: Date
    },
    trackingNumber: {
      type: String,
      default: ''
    },
    notes: {
      type: String,
      default: ''
    }
  }, {
    timestamps: true
  });

  // Generate order number before saving
  orderSchema.pre('save', async function(next) {
    if (!this.orderNumber) {
      const mongooseInstance = getMongoose();
      const count = await mongooseInstance.model('Order').countDocuments();
      this.orderNumber = `KS${Date.now()}${String(count + 1).padStart(4, '0')}`;
    }
    next();
  });

  return orderSchema;
};

// Export model with lazy loading
module.exports = (() => {
  let OrderModel;
  
  return () => {
    if (!OrderModel) {
      const mongooseInstance = getMongoose();
      const orderSchema = getOrderSchema();
      OrderModel = mongooseInstance.model('Order', orderSchema);
    }
    return OrderModel;
  };
})();
