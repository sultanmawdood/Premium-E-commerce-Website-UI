const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Product = require('./models/Product');

// Initialize app
const app = express();

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://demo:demo123@cluster0.mongodb.net/kingsports?retryWrites=true&w=majority';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Enable CORS for frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5176'], // Support both ports
  credentials: true
}));

// Parse JSON
app.use(express.json());

// Basic routes
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'KingSports API is running!',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 5001
  });
});

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to KingSports API',
    version: '2.0.0',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      test: '/api/test'
    }
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend connection successful!',
    frontend: 'http://localhost:5173',
    backend: 'http://localhost:5002'
  });
});

// Products API endpoints
app.get('/api/products', async (req, res) => {
  try {
    const { category, brand, search, minPrice, maxPrice } = req.query;
    
    // Build query object
    let query = { isActive: true };
    
    // Filter by category
    if (category && category !== 'all') {
      query.category = category.toLowerCase();
    }
    
    // Filter by brand
    if (brand && brand !== 'all') {
      query.brand = new RegExp(brand, 'i');
    }
    
    // Search by name or description
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    // Execute query
    const products = await Product.find(query).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      message: error.message
    });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product',
      message: error.message
    });
  }
});

// Get filter options
app.get('/api/products/filters/options', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    const brands = await Product.distinct('brand', { isActive: true });
    
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
    
    res.json({
      success: true,
      data: {
        categories: categories.sort(),
        brands: brands.sort(),
        priceRange: priceRange[0] || { minPrice: 0, maxPrice: 1000 }
      }
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch filter options',
      message: error.message
    });
  }
});

// Seed database endpoint (for development)
app.post('/api/seed', async (req, res) => {
  try {
    const { seedProducts, sampleProducts } = require('./seed');
    
    // Clear existing products
    await Product.deleteMany({});
    
    // Insert sample products
    const products = await Product.insertMany(sampleProducts);
    
    res.json({
      success: true,
      message: `Successfully seeded ${products.length} products`,
      count: products.length
    });
  } catch (error) {
    console.error('Error seeding products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to seed products',
      message: error.message
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log('🚀 KingSports API is running!');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/api/health`);
  console.log(`📍 Products: http://localhost:${PORT}/api/products`);
  console.log(`📍 Seed DB: POST http://localhost:${PORT}/api/seed`);
  console.log('✅ Ready to connect with frontend!');
});

module.exports = app;