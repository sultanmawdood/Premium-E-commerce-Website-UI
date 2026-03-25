require('dotenv').config();
const mongoose = require('mongoose');
const crypto = require('crypto');
const connectDB = require('../config/database');
const User = require('../models/User');
const Product = require('../models/Product');
const logger = require('./logger');

// Generate secure random password
const generateSecurePassword = (length = 16) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(crypto.randomInt(0, charset.length));
  }
  return password;
};

// Validate environment variables
const validateEnvironment = () => {
  const requiredEnvVars = ['ADMIN_EMAIL', 'ADMIN_PASSWORD'];
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    logger.warn(`Missing environment variables: ${missing.join(', ')}`);
    logger.warn('Using generated secure defaults for missing credentials');
    return false;
  }
  return true;
};

// Get secure credentials
const getCredentials = () => {
  const hasValidEnv = validateEnvironment();
  
  const credentials = {
    admin: {
      email: process.env.ADMIN_EMAIL || `admin-${Date.now()}@kingsports.local`,
      password: process.env.ADMIN_PASSWORD || generateSecurePassword(20)
    },
    sampleUser: {
      email: process.env.SAMPLE_USER_EMAIL || `user-${Date.now()}@example.local`,
      password: process.env.SAMPLE_USER_PASSWORD || generateSecurePassword(16)
    }
  };
  
  if (!hasValidEnv) {
    logger.info('Generated secure credentials for seeding');
    logger.info('IMPORTANT: Save these credentials for future use:');
    logger.info(`Admin Email: ${credentials.admin.email}`);
    logger.info(`Admin Password: ${credentials.admin.password}`);
    logger.info(`Sample User Email: ${credentials.sampleUser.email}`);
    logger.info(`Sample User Password: ${credentials.sampleUser.password}`);
  }
  
  return credentials;
};

// Sample products data
const products = [
  {
    name: 'Pro Performance Running Shoes',
    description: 'High-performance running shoes designed for speed and comfort. Features advanced cushioning technology and breathable mesh upper.',
    price: 129.99,
    originalPrice: 159.99,
    category: 'shoes',
    brand: 'KingSports',
    images: ['/images/products/shoes-1.jpg'],
    colors: ['Black', 'White', 'Blue'],
    sizes: ['7', '8', '9', '10', '11', '12'],
    stock: 50,
    rating: 4.8,
    numReviews: 124,
    badge: 'Hot',
    isFeatured: true,
    tags: ['running', 'performance', 'athletic']
  },
  {
    name: 'Elite Training T-Shirt',
    description: 'Moisture-wicking training shirt perfect for intense workouts. Lightweight and breathable fabric keeps you cool and dry.',
    price: 34.99,
    originalPrice: 44.99,
    category: 'men',
    brand: 'ProAthlete',
    images: ['/images/products/tshirt-1.jpg'],
    colors: ['Black', 'Navy', 'Gray', 'Red'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: 100,
    rating: 4.6,
    numReviews: 89,
    badge: 'Sale',
    isFeatured: true,
    tags: ['training', 'workout', 'casual']
  },
  {
    name: 'Women\'s Yoga Leggings',
    description: 'Premium yoga leggings with four-way stretch and moisture management. High-waisted design for maximum comfort and support.',
    price: 59.99,
    originalPrice: 79.99,
    category: 'women',
    brand: 'EliteGear',
    images: ['/images/products/leggings-1.jpg'],
    colors: ['Black', 'Purple', 'Teal', 'Pink'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    stock: 75,
    rating: 4.9,
    numReviews: 156,
    badge: 'New',
    isFeatured: true,
    tags: ['yoga', 'fitness', 'activewear']
  },
  {
    name: 'Sports Gym Bag',
    description: 'Spacious gym bag with multiple compartments for organized storage. Water-resistant material and padded shoulder straps.',
    price: 49.99,
    category: 'accessories',
    brand: 'SportMax',
    images: ['/images/products/bag-1.jpg'],
    colors: ['Black', 'Gray', 'Navy'],
    sizes: ['One Size'],
    stock: 40,
    rating: 4.5,
    numReviews: 67,
    badge: '',
    isFeatured: false,
    tags: ['gym', 'storage', 'travel']
  },
  {
    name: 'Compression Training Shorts',
    description: 'High-performance compression shorts for enhanced muscle support. Ideal for running, training, and all athletic activities.',
    price: 39.99,
    originalPrice: 54.99,
    category: 'men',
    brand: 'KingSports',
    images: ['/images/products/shorts-1.jpg'],
    colors: ['Black', 'Navy', 'Gray'],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 60,
    rating: 4.7,
    numReviews: 92,
    badge: 'Sale',
    isFeatured: true,
    tags: ['compression', 'training', 'running']
  },
  {
    name: 'Women\'s Sports Bra',
    description: 'High-impact sports bra with adjustable straps and removable padding. Provides maximum support during intense workouts.',
    price: 44.99,
    category: 'women',
    brand: 'ProAthlete',
    images: ['/images/products/sportsbra-1.jpg'],
    colors: ['Black', 'White', 'Pink', 'Purple'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    stock: 80,
    rating: 4.8,
    numReviews: 143,
    badge: 'Hot',
    isFeatured: true,
    tags: ['sports bra', 'support', 'workout']
  },
  {
    name: 'Lightweight Running Jacket',
    description: 'Water-resistant running jacket with reflective details. Packable design makes it easy to carry on the go.',
    price: 89.99,
    originalPrice: 119.99,
    category: 'men',
    brand: 'EliteGear',
    images: ['/images/products/jacket-1.jpg'],
    colors: ['Black', 'Navy', 'Red'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: 35,
    rating: 4.6,
    numReviews: 78,
    badge: 'New',
    isFeatured: false,
    tags: ['running', 'jacket', 'weather-resistant']
  },
  {
    name: 'Training Gloves',
    description: 'Durable training gloves with padded palms and wrist support. Perfect for weightlifting and cross-training.',
    price: 24.99,
    category: 'accessories',
    brand: 'SportMax',
    images: ['/images/products/gloves-1.jpg'],
    colors: ['Black', 'Gray'],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 90,
    rating: 4.4,
    numReviews: 54,
    badge: '',
    isFeatured: false,
    tags: ['gloves', 'training', 'protection']
  },
  {
    name: 'Cross-Training Shoes',
    description: 'Versatile cross-training shoes for gym workouts and athletic activities. Stable platform with excellent grip.',
    price: 109.99,
    category: 'shoes',
    brand: 'KingSports',
    images: ['/images/products/shoes-2.jpg'],
    colors: ['Black', 'White', 'Gray'],
    sizes: ['7', '8', '9', '10', '11', '12'],
    stock: 45,
    rating: 4.7,
    numReviews: 101,
    badge: 'Hot',
    isFeatured: true,
    tags: ['cross-training', 'gym', 'versatile']
  },
  {
    name: 'Performance Tank Top',
    description: 'Breathable tank top with moisture-wicking technology. Lightweight design perfect for hot weather training.',
    price: 29.99,
    category: 'women',
    brand: 'ProAthlete',
    images: ['/images/products/tank-1.jpg'],
    colors: ['White', 'Pink', 'Teal', 'Black'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    stock: 70,
    rating: 4.5,
    numReviews: 85,
    badge: '',
    isFeatured: false,
    tags: ['tank top', 'summer', 'breathable']
  },
  {
    name: 'Wireless Sport Earbuds',
    description: 'Sweat-resistant wireless earbuds with secure fit. Premium sound quality for your workout motivation.',
    price: 79.99,
    originalPrice: 99.99,
    category: 'accessories',
    brand: 'EliteGear',
    images: ['/images/products/earbuds-1.jpg'],
    colors: ['Black', 'White'],
    sizes: ['One Size'],
    stock: 55,
    rating: 4.6,
    numReviews: 112,
    badge: 'Sale',
    isFeatured: true,
    tags: ['audio', 'wireless', 'technology']
  },
  {
    name: 'Fitness Tracker Watch',
    description: 'Advanced fitness tracker with heart rate monitoring and GPS. Track your workouts and daily activity.',
    price: 149.99,
    category: 'accessories',
    brand: 'SportMax',
    images: ['/images/products/watch-1.jpg'],
    colors: ['Black', 'Silver'],
    sizes: ['One Size'],
    stock: 30,
    rating: 4.8,
    numReviews: 167,
    badge: 'New',
    isFeatured: true,
    tags: ['fitness', 'tracker', 'technology']
  }
];

// Seed database
const seedDatabase = async () => {
  try {
    await connectDB();

    // Get secure credentials
    const credentials = getCredentials();

    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    logger.info('Existing data cleared');

    // Create admin user with secure credentials
    const admin = await User.create({
      name: 'System Administrator',
      email: credentials.admin.email,
      password: credentials.admin.password,
      role: 'admin'
    });
    logger.info('Admin user created with secure credentials');

    // Create sample user with secure credentials
    const sampleUser = await User.create({
      name: 'Sample User',
      email: credentials.sampleUser.email,
      password: credentials.sampleUser.password,
      role: 'user'
    });
    logger.info('Sample user created with secure credentials');

    // Create products
    await Product.insertMany(products);
    logger.info(`${products.length} products created`);

    console.log('✅ Database seeded successfully!');
    console.log('\n🔐 IMPORTANT: Save these login credentials:');
    console.log('=' .repeat(50));
    console.log(`👤 Admin Login:`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${credentials.admin.password}`);
    console.log(`\n👤 Sample User Login:`);
    console.log(`   Email: ${sampleUser.email}`);
    console.log(`   Password: ${credentials.sampleUser.password}`);
    console.log('=' .repeat(50));
    console.log('\n💡 Tip: Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables');
    console.log('   to use custom credentials instead of generated ones.');
    
    process.exit(0);
  } catch (error) {
    logger.error(`Seeding error: ${error.message}`);
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();
