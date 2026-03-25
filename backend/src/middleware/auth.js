const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const redis = require('../config/redis'); // Add Redis for token blacklisting

// Token blacklist for logout/security
const tokenBlacklist = new Set();

// Protect routes - verify JWT token
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers or cookies
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new AppError('Access denied. No token provided', 401));
  }

  // Check if token is blacklisted
  if (tokenBlacklist.has(token)) {
    return next(new AppError('Token has been invalidated', 401));
  }

  try {
    // Verify JWT secret exists and is secure
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error('Invalid JWT configuration');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check token expiration with buffer
    if (decoded.exp && Date.now() >= decoded.exp * 1000 - 30000) {
      return next(new AppError('Token expired', 401));
    }

    // Get user from token with additional security checks
    const user = await User.findById(decoded.id)
      .select('-password -refreshToken')
      .lean();

    if (!user) {
      return next(new AppError('User no longer exists', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Account suspended', 403));
    }

    // Check if password changed after token was issued
    if (user.passwordChangedAt && decoded.iat < user.passwordChangedAt.getTime() / 1000) {
      return next(new AppError('Password recently changed. Please log in again', 401));
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token', 401));
    } else if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', 401));
    }
    return next(new AppError('Authentication failed', 401));
  }
});

// Blacklist token on logout
exports.blacklistToken = (token) => {
  tokenBlacklist.add(token);
  // In production, use Redis with TTL
  // redis.setex(`blacklist_${token}`, 3600, 'true');
};

// Restrict to specific roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

// Verify refresh token
exports.verifyRefreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError('Refresh token is required', 400));
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      return next(new AppError('Invalid refresh token', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new AppError('Invalid or expired refresh token', 401));
  }
});
