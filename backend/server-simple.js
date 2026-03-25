const express = require('express');
const cors = require('cors');

// Initialize app
const app = express();

// Sample products data (in-memory)
const sampleProducts = [
  {
    _id: '1',
    name: 'Nike Air Max 270',
    brand: 'Nike',
    category: 'shoes',
    price: 150,
    originalPrice: 180,
    description: 'Comfortable running shoes with Air Max technology',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    rating: 4.5,
    reviews: 128,
    inStock: true,
    isActive: true
  },
  {
    _id: '2',
    name: 'Adidas Ultraboost 22',
    brand: 'Adidas',
    category: 'shoes',
    price: 180,
    originalPrice: 200,
    description: 'Premium running shoes with Boost technology',
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400',
    rating: 4.7,
    reviews: 95,
    inStock: true,
    isActive: true
  },
  {
    _id: '3',
    name: 'Nike Dri-FIT T-Shirt',
    brand: 'Nike',
    category: 'clothing',
    price: 35,
    originalPrice: 45,
    description: 'Moisture-wicking athletic t-shirt',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    rating: 4.3,
    reviews: 67,
    inStock: true,
    isActive: true
  },
  {
    _id: '4',
    name: 'Wilson Tennis Racket',
    brand: 'Wilson',
    category: 'equipment',
    price: 120,
    originalPrice: 150,
    description: 'Professional tennis racket for advanced players',
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
    rating: 4.6,
    reviews: 43,
    inStock: true,
    isActive: true
  },
  {
    _id: '5',
    name: 'Puma Training Shorts',
    brand: 'Puma',
    category: 'clothing',
    price: 40,
    originalPrice: 50,
    description: 'Lightweight training shorts with moisture control',
    image: 'https://images.unsplash.com/photo-1506629905607-d9c297d3f5f5?w=400',
    rating: 4.2,
    reviews: 89,
    inStock: true,
    isActive: true
  },
  {
    _id: '6',
    name: 'Nike Basketball',
    brand: 'Nike',
    category: 'equipment',
    price: 60,
    originalPrice: 75,
    description: 'Official size basketball with superior grip',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
    rating: 4.4,
    reviews: 156,
    inStock: true,
    isActive: true
  }
];

// Enable CORS for frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5176'],
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
    port: process.env.PORT || 5003
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend connection successful!',
    frontend: 'http://localhost:5173',
    backend: 'http://localhost:5003'
  });
});

// Products API endpoints
app.get('/api/products', (req, res) => {
  try {
    const { category, brand, search, minPrice, maxPrice } = req.query;
    
    let filteredProducts = sampleProducts.filter(product => product.isActive);
    
    // Filter by category
    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter(product => 
        product.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Filter by brand
    if (brand && brand !== 'all') {
      filteredProducts = filteredProducts.filter(product => 
        product.brand.toLowerCase().includes(brand.toLowerCase())
      );
    }
    
    // Search by name or description
    if (search) {
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Filter by price range
    if (minPrice) {
      filteredProducts = filteredProducts.filter(product => 
        product.price >= parseFloat(minPrice)
      );
    }
    if (maxPrice) {
      filteredProducts = filteredProducts.filter(product => 
        product.price <= parseFloat(maxPrice)
      );
    }
    
    res.json({
      success: true,
      count: filteredProducts.length,
      data: filteredProducts
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
app.get('/api/products/:id', (req, res) => {
  try {
    const product = sampleProducts.find(p => p._id === req.params.id);
    
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
app.get('/api/products/filters/options', (req, res) => {
  try {
    const categories = [...new Set(sampleProducts.filter(p => p.isActive).map(p => p.category))];
    const brands = [...new Set(sampleProducts.filter(p => p.isActive).map(p => p.brand))];
    
    const prices = sampleProducts.filter(p => p.isActive).map(p => p.price);
    const priceRange = {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices)
    };
    
    res.json({
      success: true,
      data: {
        categories: categories.sort(),
        brands: brands.sort(),
        priceRange
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

// Seed endpoint (returns existing data)
app.post('/api/seed', (req, res) => {
  res.json({
    success: true,
    message: `Database already seeded with ${sampleProducts.length} products`,
    count: sampleProducts.length
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log('🚀 KingSports API is running!');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/api/health`);
  console.log(`📍 Products: http://localhost:${PORT}/api/products`);
  console.log(`📍 Seed DB: POST http://localhost:${PORT}/api/seed`);
  console.log('✅ Ready to connect with frontend!');
  console.log('💡 Using in-memory data (no MongoDB required)');
});

module.exports = app;