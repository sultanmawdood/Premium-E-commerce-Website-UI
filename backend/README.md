# KingSports E-commerce Backend API

Production-ready RESTful API for KingSports e-commerce platform built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Clean MVC Architecture** - Organized, scalable, and maintainable code structure
- **JWT Authentication** - Access tokens and refresh tokens for secure authentication
- **Role-Based Access Control** - Admin and user roles with protected routes
- **Advanced Product Filtering** - Filter by category, brand, price, rating, colors, sizes
- **Pagination & Search** - Efficient data retrieval with text search
- **Cart System** - Persistent cart storage with user sessions
- **Order Management** - Complete order lifecycle (pending → paid → shipped → delivered)
- **Stripe Integration** - Secure payment processing in test mode
- **Input Validation** - Express-validator for request validation
- **Security** - Helmet, rate limiting, mongo sanitization, bcrypt password hashing
- **Error Handling** - Centralized error handling with custom error classes
- **Logging System** - File-based logging for debugging and monitoring

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn
- Stripe account (for payment integration)

## 🛠️ Installation

1. **Clone and navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/kingsports
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
STRIPE_SECRET_KEY=sk_test_your_stripe_key
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@kingsports.com
ADMIN_PASSWORD=admin123
```

4. **Start MongoDB**
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

5. **Seed the database**
```bash
npm run seed
```

6. **Start the server**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── productController.js # Product CRUD & filtering
│   │   ├── cartController.js    # Cart management
│   │   ├── orderController.js   # Order & payment logic
│   │   └── userController.js    # User management (admin)
│   ├── middleware/
│   │   ├── auth.js              # JWT & role verification
│   │   ├── errorHandler.js      # Centralized error handling
│   │   └── validation.js        # Request validation rules
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Product.js           # Product schema
│   │   ├── Cart.js              # Cart schema
│   │   └── Order.js             # Order schema
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoints
│   │   ├── productRoutes.js     # Product endpoints
│   │   ├── cartRoutes.js        # Cart endpoints
│   │   ├── orderRoutes.js       # Order endpoints
│   │   └── userRoutes.js        # User endpoints
│   ├── utils/
│   │   ├── appError.js          # Custom error class
│   │   ├── asyncHandler.js      # Async wrapper
│   │   ├── logger.js            # Logging utility
│   │   └── seeder.js            # Database seeder
│   └── server.js                # Express app & server
├── logs/                        # Application logs
├── .env.example                 # Environment template
├── .gitignore
├── package.json
└── README.md
```

## 🔐 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login user |
| POST | `/refresh` | Public | Refresh access token |
| POST | `/logout` | Private | Logout user |
| GET | `/me` | Private | Get current user |
| PUT | `/profile` | Private | Update profile |
| PUT | `/password` | Private | Update password |

### Products (`/api/products`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Public | Get all products (with filters) |
| GET | `/featured` | Public | Get featured products |
| GET | `/filters` | Public | Get available filters |
| GET | `/:id` | Public | Get single product |
| POST | `/` | Admin | Create product |
| PUT | `/:id` | Admin | Update product |
| DELETE | `/:id` | Admin | Delete product |

**Product Filters:**
- `category` - men, women, shoes, accessories
- `brand` - Filter by brand names
- `minPrice` & `maxPrice` - Price range
- `minRating` - Minimum rating
- `colors` - Comma-separated colors
- `sizes` - Comma-separated sizes
- `search` - Text search
- `sort` - price-asc, price-desc, rating, newest, name
- `page` & `limit` - Pagination

### Cart (`/api/cart`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Private | Get user cart |
| POST | `/` | Private | Add item to cart |
| PUT | `/:itemId` | Private | Update cart item |
| DELETE | `/:itemId` | Private | Remove item from cart |
| DELETE | `/` | Private | Clear cart |

### Orders (`/api/orders`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Private | Create order |
| GET | `/` | Admin | Get all orders |
| GET | `/my-orders` | Private | Get user orders |
| GET | `/:id` | Private | Get single order |
| PUT | `/:id/status` | Admin | Update order status |
| POST | `/:id/payment` | Private | Create payment intent |
| PUT | `/:id/pay` | Private | Mark order as paid |
| PUT | `/:id/cancel` | Private | Cancel order |

### Users (`/api/users`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Admin | Get all users |
| GET | `/stats` | Admin | Get user statistics |
| GET | `/:id` | Admin | Get single user |
| PUT | `/:id` | Admin | Update user |
| DELETE | `/:id` | Admin | Delete user |

## 📝 Request Examples

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@kingsports.com",
  "password": "admin123"
}
```

### Get Products with Filters
```bash
GET /api/products?category=men&brand=KingSports&minPrice=20&maxPrice=100&sort=price-asc&page=1&limit=12
```

### Add to Cart
```bash
POST /api/cart
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "65f1234567890abcdef12345",
  "quantity": 2,
  "size": "M",
  "color": "Black"
}
```

### Create Order
```bash
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [...],
  "shippingAddress": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "card",
  "itemsPrice": 100,
  "shippingPrice": 10,
  "taxPrice": 8,
  "totalPrice": 118
}
```

## 🔒 Security Features

- **Helmet** - Sets security HTTP headers
- **Rate Limiting** - 100 requests per 15 minutes per IP
- **Mongo Sanitization** - Prevents NoSQL injection
- **Bcrypt** - Password hashing with salt rounds
- **JWT** - Secure token-based authentication
- **CORS** - Configured for frontend origin
- **Input Validation** - Express-validator on all inputs

## 🧪 Testing with Stripe

Use Stripe test cards:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- Use any future expiry date and any 3-digit CVC

## 📊 Default Credentials

After seeding:
- **Admin**: admin@kingsports.com / admin123
- **User**: user@example.com / password123

## 🚀 Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use strong JWT secrets (generate with `openssl rand -base64 32`)
3. Configure production MongoDB URI (MongoDB Atlas recommended)
4. Set up Stripe production keys
5. Enable HTTPS
6. Configure proper CORS origins
7. Set up process manager (PM2 recommended)
8. Enable MongoDB replica set for transactions
9. Set up monitoring and logging service

## 📦 Integration with React Frontend

1. Set `FRONTEND_URL` in backend `.env`
2. Use axios or fetch in frontend
3. Store JWT in localStorage or httpOnly cookies
4. Include token in Authorization header: `Bearer <token>`
5. Handle token refresh on 401 responses
6. Configure CORS properly

Example frontend API service:
```javascript
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
```

## 🐛 Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check MONGODB_URI in `.env`
- Verify network connectivity

**JWT Token Errors:**
- Check JWT_SECRET is set
- Verify token format in Authorization header
- Check token expiration

**Stripe Payment Errors:**
- Verify STRIPE_SECRET_KEY is correct
- Use test mode keys for development
- Check Stripe dashboard for errors

## 📄 License

MIT

## 👨‍💻 Author

KingSports Development Team

---

**Happy Coding! 🎉**
