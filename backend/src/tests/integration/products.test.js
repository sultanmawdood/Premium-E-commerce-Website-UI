const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const Product = require('../../models/Product');
const User = require('../../models/User');

describe('Product API Integration Tests', () => {
  let adminUser;
  let regularUser;
  let adminToken;
  let userToken;
  let testProducts;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/kingsports_test';
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean database
    await User.deleteMany({});
    await Product.deleteMany({});

    // Create test users
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'AdminPass123!',
      role: 'admin'
    });

    regularUser = await User.create({
      name: 'Regular User',
      email: 'user@example.com',
      password: 'UserPass123!',
      role: 'user'
    });

    adminToken = adminUser.generateAccessToken();
    userToken = regularUser.generateAccessToken();

    // Create test products
    testProducts = await Product.create([
      {
        name: 'Nike Air Max',
        description: 'Premium running shoes',
        price: 129.99,
        category: 'shoes',
        brand: 'Nike',
        images: ['https://example.com/image1.jpg'],
        colors: ['black', 'white'],
        sizes: ['US8', 'US9', 'US10'],
        stock: 50,
        rating: 4.5,
        numReviews: 10,
        isActive: true
      },
      {
        name: 'Adidas T-Shirt',
        description: 'Comfortable cotton t-shirt',
        price: 29.99,
        category: 'men',
        brand: 'Adidas',
        images: ['https://example.com/image2.jpg'],
        colors: ['blue', 'red'],
        sizes: ['S', 'M', 'L'],
        stock: 100,
        rating: 4.0,
        numReviews: 5,
        isActive: true
      },
      {
        name: 'Puma Jacket',
        description: 'Waterproof sports jacket',
        price: 89.99,
        category: 'men',
        brand: 'Puma',
        images: ['https://example.com/image3.jpg'],
        colors: ['black'],
        sizes: ['M', 'L', 'XL'],
        stock: 25,
        rating: 3.8,
        numReviews: 8,
        isActive: false // Inactive product
      }
    ]);
  });

  describe('GET /api/v1/products', () => {
    it('should return all active products with default pagination', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2); // Only active products
      expect(response.body.total).toBe(2);
      expect(response.body.page).toBe(1);
      expect(response.body.pages).toBe(1);
    });

    it('should filter products by category', async () => {
      const response = await request(app)
        .get('/api/v1/products?category=shoes')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].category).toBe('shoes');
    });

    it('should filter products by brand', async () => {
      const response = await request(app)
        .get('/api/v1/products?brand=Nike')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].brand).toBe('Nike');
    });

    it('should filter products by price range', async () => {
      const response = await request(app)
        .get('/api/v1/products?minPrice=30&maxPrice=100')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].price).toBeGreaterThanOrEqual(30);
      expect(response.body.data[0].price).toBeLessThanOrEqual(100);
    });

    it('should sort products by price ascending', async () => {
      const response = await request(app)
        .get('/api/v1/products?sort=price-asc')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data[0].price).toBeLessThan(response.body.data[1].price);
    });

    it('should sort products by price descending', async () => {
      const response = await request(app)
        .get('/api/v1/products?sort=price-desc')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data[0].price).toBeGreaterThan(response.body.data[1].price);
    });

    it('should search products by text', async () => {
      const response = await request(app)
        .get('/api/v1/products?search=Nike')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toContain('Nike');
    });

    it('should paginate results correctly', async () => {
      const response = await request(app)
        .get('/api/v1/products?page=1&limit=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.page).toBe(1);
      expect(response.body.pages).toBe(2);
      expect(response.body.total).toBe(2);
    });

    it('should validate pagination parameters', async () => {
      const response = await request(app)
        .get('/api/v1/products?page=0&limit=101')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/products/:id', () => {
    it('should return a single product by ID', async () => {
      const product = testProducts[0];
      const response = await request(app)
        .get(`/api/v1/products/${product._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(product._id.toString());
      expect(response.body.data.name).toBe(product.name);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/v1/products/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should return 400 for invalid product ID', async () => {
      const response = await request(app)
        .get('/api/v1/products/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/products', () => {
    const validProductData = {
      name: 'New Test Product',
      description: 'A test product description',
      price: 49.99,
      category: 'accessories',
      brand: 'TestBrand',
      images: ['https://example.com/test.jpg'],
      colors: ['red'],
      sizes: ['ONE'],
      stock: 10
    };

    it('should create a new product as admin', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validProductData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(validProductData.name);
      expect(response.body.data.slug).toBeDefined();

      // Verify product was created in database
      const product = await Product.findById(response.body.data._id);
      expect(product).toBeTruthy();
    });

    it('should reject product creation by regular user', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validProductData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('permission');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .send(validProductData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        name: '', // Empty name
        price: -10, // Negative price
        category: 'invalid-category'
      };

      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate image URLs', async () => {
      const invalidData = {
        ...validProductData,
        images: ['not-a-url', 'also-not-a-url']
      };

      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/products/:id', () => {
    it('should update a product as admin', async () => {
      const product = testProducts[0];
      const updateData = {
        name: 'Updated Product Name',
        price: 199.99
      };

      const response = await request(app)
        .put(`/api/v1/products/${product._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.price).toBe(updateData.price);

      // Verify update in database
      const updatedProduct = await Product.findById(product._id);
      expect(updatedProduct.name).toBe(updateData.name);
    });

    it('should reject update by regular user', async () => {
      const product = testProducts[0];
      const response = await request(app)
        .put(`/api/v1/products/${product._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Hacked Name' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/v1/products/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/products/:id', () => {
    it('should delete a product as admin', async () => {
      const product = testProducts[0];
      const response = await request(app)
        .delete(`/api/v1/products/${product._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');

      // Verify deletion in database
      const deletedProduct = await Product.findById(product._id);
      expect(deletedProduct).toBeNull();
    });

    it('should reject deletion by regular user', async () => {
      const product = testProducts[0];
      const response = await request(app)
        .delete(`/api/v1/products/${product._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/products/featured', () => {
    beforeEach(async () => {
      // Mark one product as featured
      await Product.findByIdAndUpdate(testProducts[0]._id, { isFeatured: true });
    });

    it('should return featured products', async () => {
      const response = await request(app)
        .get('/api/v1/products/featured')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].isFeatured).toBe(true);
    });
  });

  describe('GET /api/v1/products/filters', () => {
    it('should return available filter options', async () => {
      const response = await request(app)
        .get('/api/v1/products/filters')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('brands');
      expect(response.body.data).toHaveProperty('colors');
      expect(response.body.data).toHaveProperty('sizes');
      expect(response.body.data).toHaveProperty('priceRange');

      expect(response.body.data.brands).toContain('Nike');
      expect(response.body.data.brands).toContain('Adidas');
      expect(response.body.data.priceRange).toHaveProperty('minPrice');
      expect(response.body.data.priceRange).toHaveProperty('maxPrice');
    });
  });

  describe('Performance Tests', () => {
    beforeEach(async () => {
      // Create many products for performance testing
      const products = [];
      for (let i = 0; i < 100; i++) {
        products.push({
          name: `Product ${i}`,
          description: `Description for product ${i}`,
          price: Math.random() * 100 + 10,
          category: ['men', 'women', 'shoes', 'accessories'][i % 4],
          brand: ['Nike', 'Adidas', 'Puma'][i % 3],
          images: [`https://example.com/image${i}.jpg`],
          colors: ['red', 'blue', 'black'][i % 3],
          sizes: ['S', 'M', 'L'],
          stock: Math.floor(Math.random() * 100),
          isActive: true
        });
      }
      await Product.insertMany(products);
    });

    it('should handle large product lists efficiently', async () => {
      const start = Date.now();
      const response = await request(app)
        .get('/api/v1/products?limit=50')
        .expect(200);

      const duration = Date.now() - start;
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(50);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle complex filtering efficiently', async () => {
      const start = Date.now();
      const response = await request(app)
        .get('/api/v1/products?category=men&brand=Nike&minPrice=20&maxPrice=80&sort=price-desc')
        .expect(200);

      const duration = Date.now() - start;
      
      expect(response.body.success).toBe(true);
      expect(duration).toBeLessThan(500); // Should complete within 500ms
    });
  });
});