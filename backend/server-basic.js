const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');

// Initialize app
const app = express();

// Enable CORS for frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5176'], // Support both ports
  credentials: true
}));

// Parse JSON and cookies
app.use(express.json());
app.use(cookieParser());

// Serve static files (for uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/products', require('./src/routes/productRoutes'));

// Basic routes
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'KingSports API is running!',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 5000
  });
});

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to KingSports API',
    version: '2.0.0',
    endpoints: {
      health: '/api/health',
      test: '/api/test',
      auth: '/api/auth',
      products: '/api/products'
    }
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend connection successful!',
    frontend: 'http://localhost:5176',
    backend: 'http://localhost:5001'
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
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log('🚀 KingSports API is running!');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/api/health`);
  console.log(`📍 Test: http://localhost:${PORT}/api/test`);
  console.log('✅ Ready to connect with frontend!');
});