const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const path = require('path');
const fs = require('fs');

// @desc    Get all products with filtering, sorting, pagination
// @route   GET /api/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res, next) => {
  const {
    category,
    brand,
    minPrice,
    maxPrice,
    minRating,
    colors,
    sizes,
    search,
    sort,
    page = 1,
    limit = 12
  } = req.query;

  // Build query
  let query = { isActive: true };

  // Category filter
  if (category) {
    query.category = category.toLowerCase();
  }

  // Brand filter
  if (brand) {
    query.brand = { $in: brand.split(',') };
  }

  // Price range filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Rating filter
  if (minRating) {
    query.rating = { $gte: Number(minRating) };
  }

  // Colors filter
  if (colors) {
    query.colors = { $in: colors.split(',') };
  }

  // Sizes filter
  if (sizes) {
    query.sizes = { $in: sizes.split(',').map(s => s.toUpperCase()) };
  }

  // Search
  if (search) {
    query.$text = { $search: search };
  }

  // Sorting
  let sortOption = {};
  if (sort) {
    const sortFields = {
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      'rating': { rating: -1 },
      'newest': { createdAt: -1 },
      'name': { name: 1 }
    };
    sortOption = sortFields[sort] || { createdAt: -1 };
  } else {
    sortOption = { createdAt: -1 };
  }

  // Pagination
  const skip = (page - 1) * limit;

  // Execute query
  const products = await Product.find(query)
    .sort(sortOption)
    .limit(Number(limit))
    .skip(skip);

  // Get total count
  const total = await Product.countDocuments(query);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    data: products
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    data: product
  });
});

// @desc    Upload product images
// @route   POST /api/products/:id/images
// @access  Private/Admin
exports.uploadProductImages = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  if (!req.body.images || req.body.images.length === 0) {
    return next(new AppError('Please upload at least one image', 400));
  }

  // Add new images to existing ones
  product.images = [...product.images, ...req.body.images];
  await product.save();

  res.status(200).json({
    success: true,
    message: 'Images uploaded successfully',
    data: product
  });
});

// @desc    Delete product image
// @route   DELETE /api/products/:id/images/:imageIndex
// @access  Private/Admin
exports.deleteProductImage = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  const imageIndex = parseInt(req.params.imageIndex);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  if (imageIndex < 0 || imageIndex >= product.images.length) {
    return next(new AppError('Invalid image index', 400));
  }

  // Delete file from filesystem
  const imagePath = product.images[imageIndex];
  const fullPath = path.join(__dirname, '../../', imagePath);
  
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }

  // Remove image from array
  product.images.splice(imageIndex, 1);
  await product.save();

  res.status(200).json({
    success: true,
    message: 'Image deleted successfully',
    data: product
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully'
  });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = asyncHandler(async (req, res, next) => {
  const products = await Product.find({ isFeatured: true, isActive: true })
    .limit(8)
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

// @desc    Get product filters (brands, colors, price range)
// @route   GET /api/products/filters
// @access  Public
exports.getFilters = asyncHandler(async (req, res, next) => {
  const brands = await Product.distinct('brand', { isActive: true });
  const colors = await Product.distinct('colors', { isActive: true });
  const sizes = await Product.distinct('sizes', { isActive: true });
  
  const priceRange = await Product.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      brands: brands.sort(),
      colors: colors.sort(),
      sizes: sizes.sort(),
      priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 }
    }
  });
});
