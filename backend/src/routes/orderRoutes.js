
let express;
let orderController;
let authMiddleware;
let validationMiddleware;
let router;

// Lazy loading functions
const getExpress = () => {
  if (!express) {
    express = require('express');
  }
  return express;
};

const getOrderController = () => {
  if (!orderController) {
    orderController = require('../controllers/orderController');
  }
  return orderController;
};

const getAuthMiddleware = () => {
  if (!authMiddleware) {
    authMiddleware = require('../middleware/auth');
  }
  return authMiddleware;
};

const getValidationMiddleware = () => {
  if (!validationMiddleware) {
    validationMiddleware = require('../middleware/validation');
  }
  return validationMiddleware;
};

// Create router with lazy loading - only when actually needed
const getRouter = () => {
  if (!router) {
    const expressInstance = getExpress();
    router = expressInstance.Router();
    
    const {
      createOrder,
      getOrders,
      getMyOrders,
      getOrder,
      updateOrderStatus,
      createPaymentIntent,
      updateOrderToPaid,
      cancelOrder
    } = getOrderController();
    
    const { protect, restrictTo } = getAuthMiddleware();
    
    const {
      createOrderValidation,
      validateId,
      paginationValidation,
      validate
    } = getValidationMiddleware();

    router.post('/', protect, createOrderValidation, validate, createOrder);
    router.get('/', protect, restrictTo('admin'), paginationValidation, validate, getOrders);
    router.get('/my-orders', protect, getMyOrders);
    router.get('/:id', protect, validateId, validate, getOrder);

    router.put(
      '/:id/status',
      protect,
      restrictTo('admin'),
      validateId,
      validate,
      updateOrderStatus
    );

    router.post(
      '/:id/payment',
      protect,
      validateId,
      validate,
      createPaymentIntent
    );

    router.put(
      '/:id/pay',
      protect,
      validateId,
      validate,
      updateOrderToPaid
    );

    router.put(
      '/:id/cancel',
      protect,
      validateId,
      validate,
      cancelOrder
    );
  }
  
  return router;
};

// Export lazy router getter
module.exports = getRouter();
