# Mobile Shop - Complete Backend API

## 🚀 Complete, Production-Ready Backend

Full-stack Node.js + Express.js + MongoDB backend for mobile e-commerce platform.

## ✅ What's Included (30 Files)

### Core Files (4)
✅ server.js - Main application entry point
✅ package.json - All dependencies
✅ .env.example - Environment configuration template
✅ .gitignore - Git ignore rules

### Database Models (9)
✅ models/User.js - User authentication & profiles
✅ models/Product.js - Product catalog with specs
✅ models/Category.js - Product categories
✅ models/Brand.js - Mobile brands
✅ models/Cart.js - Shopping cart management
✅ models/Order.js - Order processing
✅ models/Review.js - Product reviews & ratings
✅ models/Address.js - User addresses
✅ models/Wishlist.js - User wishlists

### API Routes (9)
✅ routes/authRoutes.js - Authentication (login, register, profile)
✅ routes/productRoutes.js - Product CRUD with filters
✅ routes/cartRoutes.js - Cart operations
✅ routes/orderRoutes.js - Order placement & tracking
✅ routes/userRoutes.js - User management
✅ routes/categoryRoutes.js - Category management
✅ routes/brandRoutes.js - Brand management
✅ routes/reviewRoutes.js - Review management
✅ routes/adminRoutes.js - Admin dashboard & analytics

### Middleware (4)
✅ middleware/auth.js - JWT authentication & authorization
✅ middleware/upload.js - File upload (Multer)
✅ middleware/validate.js - Input validation
✅ middleware/errorHandler.js - Error handling

### Utilities (3)
✅ utils/emailService.js - Email notifications
✅ utils/paymentService.js - Payment gateway integration
✅ utils/helpers.js - Helper functions

### Configuration (1)
✅ config/database.js - MongoDB connection

---

## 🛠️ Installation

### Prerequisites
- Node.js v16 or higher
- MongoDB v5 or higher
- npm or yarn

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your settings:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mobile_shop
JWT_SECRET=your_32_character_secret_key_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
FRONTEND_URL=http://localhost:3000
```

### Step 3: Start MongoDB
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas connection string in .env
```

### Step 4: Run the Server
```bash
# Development
npm run dev

# Production
npm start
```

Server will start on: **http://localhost:5000**

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

**Register User**
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phoneNumber": "1234567890"
}
```

**Login User**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {...}
}
```

**Get Profile** (Protected)
```http
GET /api/auth/profile
Authorization: Bearer {token}
```

### Product Endpoints

**Get All Products**
```http
GET /api/products?page=1&limit=12&search=iphone&brand=apple&minPrice=10000&maxPrice=50000
```

**Get Single Product**
```http
GET /api/products/:id
```

**Create Product** (Admin)
```http
POST /api/products
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "iPhone 15 Pro",
  "price": 129999,
  "brandId": "brand_id",
  "categoryId": "category_id",
  "sku": "IPH15PRO",
  "images": ["url1", "url2"],
  "specifications": {...},
  "stockQuantity": 50
}
```

### Cart Endpoints

**Get Cart** (Protected)
```http
GET /api/cart
Authorization: Bearer {token}
```

**Add to Cart** (Protected)
```http
POST /api/cart/add
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "product_id",
  "quantity": 1
}
```

**Update Cart** (Protected)
```http
PUT /api/cart/update
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "product_id",
  "quantity": 2
}
```

**Remove from Cart** (Protected)
```http
DELETE /api/cart/remove
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "product_id"
}
```

### Order Endpoints

**Create Order** (Protected)
```http
POST /api/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "shippingAddress": {
    "fullName": "John Doe",
    "phoneNumber": "1234567890",
    "streetAddress": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India"
  },
  "paymentMethod": "cod"
}
```

**Get User Orders** (Protected)
```http
GET /api/orders
Authorization: Bearer {token}
```

**Get Order Details** (Protected)
```http
GET /api/orders/:id
Authorization: Bearer {token}
```

### Admin Endpoints

**Get Dashboard Analytics** (Admin)
```http
GET /api/admin/dashboard
Authorization: Bearer {admin_token}
```

**Update Order Status** (Admin)
```http
PUT /api/admin/orders/:id/status
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "orderStatus": "shipped"
}
```

---

## 🔒 Security Features

✅ JWT-based authentication
✅ Password hashing with bcrypt (10 rounds)
✅ Protected routes with middleware
✅ Role-based authorization (customer/admin)
✅ Input validation
✅ CORS configuration
✅ Helmet.js security headers
✅ Error handling

---

## 🗄️ Database Models

### User Schema
- firstName, lastName, email, password
- phoneNumber, dateOfBirth, gender
- role (customer/admin)
- wishlist array
- Timestamps

### Product Schema
- name, slug, description, SKU
- price, comparePrice, images
- brandId, categoryId
- specifications (display, processor, RAM, etc.)
- stockQuantity, lowStockThreshold
- averageRating, totalReviews
- Timestamps

### Order Schema
- orderNumber, userId
- items array (product, quantity, price)
- totalAmount, taxAmount, shippingAmount
- shippingAddress, billingAddress
- paymentMethod, paymentStatus
- orderStatus, trackingNumber
- Timestamps

### Cart Schema
- userId
- items array (productId, quantity, price)
- totalItems, totalAmount
- Timestamps

---

## 📁 Project Structure

```
mobile-shop-backend-complete/
├── config/
│   └── database.js
├── models/
│   ├── User.js
│   ├── Product.js
│   ├── Category.js
│   ├── Brand.js
│   ├── Cart.js
│   ├── Order.js
│   ├── Review.js
│   ├── Address.js
│   └── Wishlist.js
├── routes/
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── cartRoutes.js
│   ├── orderRoutes.js
│   ├── userRoutes.js
│   ├── categoryRoutes.js
│   ├── brandRoutes.js
│   ├── reviewRoutes.js
│   └── adminRoutes.js
├── middleware/
│   ├── auth.js
│   ├── upload.js
│   ├── validate.js
│   └── errorHandler.js
├── utils/
│   ├── emailService.js
│   ├── paymentService.js
│   └── helpers.js
├── server.js
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 🧪 Testing

### Manual Testing with cURL or Postman

1. Register a user
2. Login to get token
3. Get products
4. Add items to cart
5. Create an order
6. Check order status

### Example Test Flow
```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@test.com","password":"test123","phoneNumber":"1234567890"}'

# 2. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"test123"}'

# 3. Get Products
curl http://localhost:5000/api/products

# 4. Get Cart (use token from login)
curl http://localhost:5000/api/cart \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🚀 Deployment

### Deploy to Heroku
```bash
heroku create mobile-shop-api
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_secret
git push heroku main
```

### Deploy to Railway
```bash
railway login
railway init
railway up
```

### MongoDB Atlas Setup
1. Create cluster at mongodb.com/cloud/atlas
2. Create database user
3. Whitelist IP (0.0.0.0/0 for development)
4. Get connection string
5. Update MONGODB_URI in .env

---

## 🐛 Troubleshooting

**Server won't start:**
- Check MongoDB is running
- Verify .env file exists
- Check port 5000 is available

**Authentication errors:**
- Verify JWT_SECRET is set (min 32 chars)
- Check token format: "Bearer {token}"
- Ensure user exists in database

**Database connection failed:**
- Check MONGODB_URI format
- Verify MongoDB service is running
- Check network connectivity

**CORS errors:**
- Verify FRONTEND_URL in .env
- Check CORS configuration in server.js

---

## 📝 Environment Variables

Required in `.env`:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mobile_shop
JWT_SECRET=your_32_character_minimum_secret_key
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_password
FRONTEND_URL=http://localhost:3000
```

---

## 🔄 API Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...}
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "..."
}
```

---

## 📄 License

MIT License - Free to use for personal and commercial projects

---

## 🎉 Features

✅ Complete RESTful API
✅ User authentication & authorization
✅ Product catalog with filters & search
✅ Shopping cart management
✅ Order processing & tracking
✅ Product reviews & ratings
✅ Admin dashboard with analytics
✅ Email notifications
✅ Payment gateway ready
✅ File upload support
✅ Input validation
✅ Error handling
✅ Security best practices

---

## 👨‍💻 Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start
```

---

## 📞 Support

For issues or questions:
- Check the documentation
- Review API endpoints
- Test with Postman
- Check MongoDB connection
- Verify environment variables

---

**Built with Node.js, Express.js, MongoDB, JWT**

**Complete. Production-Ready. Fully Functional.**
