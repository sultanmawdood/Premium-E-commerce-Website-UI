let express;
let cartController;
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

const getCartController = () => {
  if (!cartController) {
    cartController = require('../controllers/cartController');
  }
  return cartController;
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
      getCart,
      addToCart,
      updateCartItem,
      removeFromCart,
      clearCart
    } = getCartController();
    
    const { protect } = getAuthMiddleware();
    const { addToCartValidation, validate } = getValidationMiddleware();

    router.use(protect);

    router.route('/')
      .get(getCart)
      .post(addToCartValidation, validate, addToCart)
      .delete(clearCart);

    router.route('/:itemId')
      .put(updateCartItem)
      .delete(removeFromCart);
  }
  
  return router;
};

// Export lazy router getter
module.exports = getRouter();
