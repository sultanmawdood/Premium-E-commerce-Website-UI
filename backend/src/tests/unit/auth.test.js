const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = require('../../server');
const User = require('../../models/User');
const Cart = require('../../models/Cart');

// Mock external dependencies
jest.mock('../../utils/logger');
jest.mock('../../utils/sentry');
jest.mock('../../utils/metrics');

describe('Auth Controller', () => {
  let server;
  
  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/kingsports_test';
    await mongoose.connect(mongoUri);
    
    server = app.listen(0); // Use random port for testing
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    server.close();
  });

  beforeEach(async () => {
    // Clean database before each test
    await User.deleteMany({});
    await Cart.deleteMany({});
  });

  describe('POST /api/v1/auth/register', () => {
    const validUserData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!'
    };

    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(validUserData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body.user).toMatchObject({
        name: validUserData.name,
        email: validUserData.email,
        role: 'user'
      });
      expect(response.body.user.password).toBeUndefined();

      // Verify user was created in database
      const user = await User.findOne({ email: validUserData.email });
      expect(user).toBeTruthy();
      expect(user.name).toBe(validUserData.name);

      // Verify cart was created
      const cart = await Cart.findOne({ user: user._id });
      expect(cart).toBeTruthy();
      expect(cart.items).toHaveLength(0);
    });

    it('should return validation errors for invalid data', async () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        password: '123' // Too short
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('validation');
    });

    it('should prevent duplicate email registration', async () => {
      // Create user first
      await User.create({
        name: 'Existing User',
        email: validUserData.email,
        password: await bcrypt.hash('password123', 12)
      });

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(validUserData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should enforce strong password requirements', async () => {
      const weakPasswords = [
        'password', // No uppercase, number, special char
        'PASSWORD', // No lowercase, number, special char
        'Password', // No number, special char
        'Password1', // No special char
        'Pass1!' // Too short
      ];

      for (const password of weakPasswords) {
        const response = await request(app)
          .post('/api/v1/auth/register')
          .send({
            ...validUserData,
            email: `test${Date.now()}@example.com`,
            password
          })
          .expect(400);

        expect(response.body.success).toBe(false);
      }
    });
  });

  describe('POST /api/v1/auth/login', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        isActive: true
      });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');

      // Verify JWT token
      const decoded = jwt.verify(response.body.accessToken, process.env.JWT_SECRET);
      expect(decoded.id).toBe(testUser._id.toString());
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'Password123!'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid email or password');
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid email or password');
    });

    it('should reject login for inactive user', async () => {
      await User.findByIdAndUpdate(testUser._id, { isActive: false });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('deactivated');
    });

    it('should implement account lockout after failed attempts', async () => {
      // Make 5 failed login attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongpassword'
          });
      }

      // 6th attempt should be locked
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!' // Even with correct password
        })
        .expect(423);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('locked');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    let testUser;
    let refreshToken;

    beforeEach(async () => {
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!'
      });

      refreshToken = testUser.generateRefreshToken();
      testUser.refreshToken = refreshToken;
      await testUser.save();
    });

    it('should refresh access token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.accessToken).toBeDefined();

      // Verify new token is valid
      const decoded = jwt.verify(response.body.accessToken, process.env.JWT_SECRET);
      expect(decoded.id).toBe(testUser._id.toString());
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid');
    });

    it('should reject expired refresh token', async () => {
      const expiredToken = jwt.sign(
        { id: testUser._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '-1h' }
      );

      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: expiredToken })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('expired');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    let testUser;
    let accessToken;

    beforeEach(async () => {
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!'
      });

      accessToken = testUser.generateAccessToken();
      testUser.refreshToken = testUser.generateRefreshToken();
      await testUser.save();
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logged out');

      // Verify refresh token was cleared
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.refreshToken).toBeUndefined();
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Access denied');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    let testUser;
    let accessToken;

    beforeEach(async () => {
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        role: 'user'
      });

      accessToken = testUser.generateAccessToken();
    });

    it('should return current user data', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      });
      expect(response.body.data.password).toBeUndefined();
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/auth/password', () => {
    let testUser;
    let accessToken;

    beforeEach(async () => {
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'OldPassword123!'
      });

      accessToken = testUser.generateAccessToken();
    });

    it('should update password successfully', async () => {
      const response = await request(app)
        .put('/api/v1/auth/password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'OldPassword123!',
          newPassword: 'NewPassword123!'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.accessToken).toBeDefined();

      // Verify password was changed
      const updatedUser = await User.findById(testUser._id).select('+password');
      const isNewPasswordValid = await updatedUser.comparePassword('NewPassword123!');
      expect(isNewPasswordValid).toBe(true);
    });

    it('should reject incorrect current password', async () => {
      const response = await request(app)
        .put('/api/v1/auth/password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'WrongPassword123!',
          newPassword: 'NewPassword123!'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Current password is incorrect');
    });

    it('should enforce strong password requirements for new password', async () => {
      const response = await request(app)
        .put('/api/v1/auth/password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'OldPassword123!',
          newPassword: 'weak'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});