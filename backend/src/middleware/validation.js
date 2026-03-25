// Lazy load express-validator modules
let expressValidator;
let AppError;

// Lazy loading function for express-validator
const getExpressValidator = () => {
  if (!expressValidator) {
    expressValidator = require('express-validator');
  }
  return expressValidator;
};

// Lazy loading function for AppError
const getAppError = () => {
  if (!AppError) {
    AppError = require('../utils/appError');
  }
  return AppError;
};

// Validation result handler
exports.validate = (req, res, next) => {
  const { validationResult } = getExpressValidator();
  const AppErrorClass = getAppError();
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg).join(', ');
    return next(new AppErrorClass(errorMessages, 400));
  }
  next();
};

// User validation rules
exports.registerValidation = [
  (() => {
    const { body } = getExpressValidator();
    return [
      body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
      body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
      body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    ];
  })()
].flat();

exports.loginValidation = [
  (() => {
    const { body } = getExpressValidator();
    return [
      body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
      body('password').notEmpty().withMessage('Password is required')
    ];
  })()
].flat();

exports.updateProfileValidation = [
  (() => {
    const { body } = getExpressValidator();
    return [
      body('name').optional().trim().isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
      body('email').optional().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
      body('phone').optional().trim()
    ];
  })()
].flat();

// Product validation rules
exports.createProductValidation = [
  (() => {
    const { body } = getExpressValidator();
    return [
      body('name').trim().notEmpty().withMessage('Product name is required').isLength({ max: 200 }).withMessage('Name cannot exceed 200 characters'),
      body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
      body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
      body('category').isIn(['men', 'women', 'shoes', 'accessories']).withMessage('Invalid category'),
      body('brand').trim().notEmpty().withMessage('Brand is required'),
      body('images').isArray({ min: 1 }).withMessage('At least one image is required'),
      body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
    ];
  })()
].flat();

exports.updateProductValidation = [
  (() => {
    const { body } = getExpressValidator();
    return [
      body('name').optional().trim().isLength({ max: 200 }).withMessage('Name cannot exceed 200 characters'),
      body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
      body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
      body('category').optional().isIn(['men', 'women', 'shoes', 'accessories']).withMessage('Invalid category'),
      body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
    ];
  })()
].flat();

// Cart validation rules
exports.addToCartValidation = [
  (() => {
    const { body } = getExpressValidator();
    return [
      body('productId').notEmpty().withMessage('Product ID is required').isMongoId().withMessage('Invalid product ID'),
      body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
      body('size').trim().notEmpty().withMessage('Size is required'),
      body('color').trim().notEmpty().withMessage('Color is required')
    ];
  })()
].flat();

// Order validation rules
exports.createOrderValidation = [
  (() => {
    const { body } = getExpressValidator();
    return [
      body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
      body('shippingAddress.name').trim().notEmpty().withMessage('Recipient name is required'),
      body('shippingAddress.email').isEmail().withMessage('Valid email is required'),
      body('shippingAddress.phone').trim().notEmpty().withMessage('Phone number is required'),
      body('shippingAddress.street').trim().notEmpty().withMessage('Street address is required'),
      body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
      body('shippingAddress.state').trim().notEmpty().withMessage('State is required'),
      body('shippingAddress.zipCode').trim().notEmpty().withMessage('Zip code is required'),
      body('shippingAddress.country').trim().notEmpty().withMessage('Country is required'),
      body('paymentMethod').isIn(['card', 'paypal']).withMessage('Invalid payment method')
    ];
  })()
].flat();

// ID validation
exports.validateId = [
  (() => {
    const { param } = getExpressValidator();
    return [
      param('id').isMongoId().withMessage('Invalid ID format')
    ];
  })()
].flat();

// Query validation
exports.paginationValidation = [
  (() => {
    const { query } = getExpressValidator();
    return [
      query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    ];
  })()
].flat();
