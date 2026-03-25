const mongoose = require('mongoose');
const Product = require('./models/Product');

// Sample product data
const sampleProducts = [
  {
    name: 'Nike Air Max 270',
    price: 150.00,
    category: 'shoes',
    brand: 'Nike',
    description: 'The Nike Air Max 270 delivers visible Air cushioning from heel to toe.',
    colors: ['Black', 'White', 'Red'],
    sizes: ['US7', 'US8', 'US9', 'US10', 'US11'],
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
    stock: 25,
    rating: 4.5
  },
  {
    name: 'Adidas Ultraboost 22',
    price: 180.00,
    category: 'shoes',
    brand: 'Adidas',
    description: 'Experience incredible energy return with Adidas Ultraboost 22.',
    colors: ['Black', 'White', 'Blue'],
    sizes: ['US7', 'US8', 'US9', 'US10', 'US11'],
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&h=500&fit=crop',
    stock: 30,
    rating: 4.7
  },
  {
    name: 'Nike Dri-FIT T-Shirt',
    price: 35.00,
    category: 'men',
    brand: 'Nike',
    description: 'Stay dry and comfortable with Nike Dri-FIT technology.',
    colors: ['Black', 'White', 'Navy', 'Red'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
    stock: 50,
    rating: 4.2
  },
  {
    name: 'Adidas 3-Stripes Track Jacket',
    price: 75.00,
    category: 'men',
    brand: 'Adidas',
    description: 'Classic Adidas track jacket with iconic 3-stripes design.',
    colors: ['Black', 'Navy', 'Green'],
    sizes: ['S', 'M', 'L', 'XL'],
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=500&fit=crop',
    stock: 20,
    rating: 4.3
  },
  {
    name: 'Puma Women\'s Sports Bra',
    price: 45.00,
    category: 'women',
    brand: 'Puma',
    description: 'High-support sports bra perfect for intense workouts.',
    colors: ['Black', 'Pink', 'Purple'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    image: 'https://images.unsplash.com/photo-1506629905607-d9c297d3f5f5?w=500&h=500&fit=crop',
    stock: 35,
    rating: 4.4
  },
  {
    name: 'Under Armour Leggings',
    price: 60.00,
    category: 'women',
    brand: 'Under Armour',
    description: 'Compression leggings with moisture-wicking technology.',
    colors: ['Black', 'Gray', 'Navy'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    image: 'https://images.unsplash.com/photo-1506629905607-d9c297d3f5f5?w=500&h=500&fit=crop',
    stock: 40,
    rating: 4.6
  },
  {
    name: 'Nike Baseball Cap',
    price: 25.00,
    category: 'accessories',
    brand: 'Nike',
    description: 'Classic Nike baseball cap with adjustable strap.',
    colors: ['Black', 'White', 'Red', 'Blue'],
    sizes: ['ONE SIZE'],
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&h=500&fit=crop',
    stock: 60,
    rating: 4.1
  },
  {
    name: 'Adidas Gym Bag',
    price: 40.00,
    category: 'accessories',
    brand: 'Adidas',
    description: 'Spacious gym bag with multiple compartments.',
    colors: ['Black', 'Navy', 'Gray'],
    sizes: ['ONE SIZE'],
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
    stock: 15,
    rating: 4.0
  },
  {
    name: 'Puma Running Shorts',
    price: 30.00,
    category: 'men',
    brand: 'Puma',
    description: 'Lightweight running shorts with built-in brief.',
    colors: ['Black', 'Blue', 'Gray'],
    sizes: ['S', 'M', 'L', 'XL'],
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=500&fit=crop',
    stock: 45,
    rating: 4.2
  },
  {
    name: 'Nike Women\'s Tank Top',
    price: 28.00,
    category: 'women',
    brand: 'Nike',
    description: 'Breathable tank top perfect for training sessions.',
    colors: ['White', 'Pink', 'Purple', 'Black'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=500&fit=crop',
    stock: 55,
    rating: 4.3
  },
  {
    name: 'Adidas Soccer Cleats',
    price: 120.00,
    category: 'shoes',
    brand: 'Adidas',
    description: 'Professional soccer cleats with superior grip and control.',
    colors: ['Black', 'White', 'Blue'],
    sizes: ['US6', 'US7', 'US8', 'US9', 'US10', 'US11'],
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&h=500&fit=crop',
    stock: 20,
    rating: 4.8
  },
  {
    name: 'Under Armour Water Bottle',
    price: 15.00,
    category: 'accessories',
    brand: 'Under Armour',
    description: 'Insulated water bottle keeps drinks cold for 24 hours.',
    colors: ['Black', 'Silver', 'Blue'],
    sizes: ['500ML', '750ML'],
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&h=500&fit=crop',
    stock: 80,
    rating: 4.5
  }
];

// Seed function
const seedProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kingsports');
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    const products = await Product.insertMany(sampleProducts);
    console.log(`✅ Successfully seeded ${products.length} products`);

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedProducts();
}

module.exports = { seedProducts, sampleProducts };