// Lazy load dependencies
let express;
let userController;
let authMiddleware;
let validationMiddleware;

// Lazy loading functions
const getExpress = () => {
  if (!express) {
    express = require('express');
  }
  return express;
};

const getUserController = () => {
  if (!userController) {
    userController = require('../controllers/userController');
  }
  return userController;
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

// Create router with lazy loading
const createRouter = () => {
  const expressInstance = getExpress();
  const router = expressInstance.Router();
  
  const {
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    getUserStats
  } = getUserController();
  
  const { protect, restrictTo } = getAuthMiddleware();
  
  const {
    validateId,
    paginationValidation,
    validate
  } = getValidationMiddleware();

  router.use(protect);
  router.use(restrictTo('admin'));

  router.get('/', paginationValidation, validate, getUsers);
  router.get('/stats', getUserStats);
  router.get('/:id', validateId, validate, getUser);
  router.put('/:id', validateId, validate, updateUser);
  router.delete('/:id', validateId, validate, deleteUser);

  return router;
};

module.exports = createRouter();
