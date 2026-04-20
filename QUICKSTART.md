# Quick Start Guide - CartFlow API

## ⚡ Get Running in 5 Minutes

### 1️⃣ Prerequisites
```bash
# Check Node.js version (v14+)
node --version

# Check npm version
npm --version

# MongoDB (use MongoDB Atlas - free tier available)
# Sign up at: https://www.mongodb.com/cloud/atlas
```

### 2️⃣ Clone & Setup
```bash
# Navigate to project directory
cd "c:\Users\user\Desktop\Cartflow API"

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

### 3️⃣ Configure .env
```env
# Required for basic setup
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/cartflow
JWT_SECRET=your_secret_key_here
PORT=5000

# Email (optional for testing)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=app_specific_password

# Paystack (get keys from https://dashboard.paystack.com)
PAYSTACK_SECRET_KEY=sk_test_xxx
PAYSTACK_PUBLIC_KEY=pk_test_xxx

# Redis (optional, auto-skipped if not available)
REDIS_URL=redis://localhost:6379
```

### 4️⃣ Seed Database
```bash
npm run seed
```

Output:
```
✅ Connected to MongoDB
🗑️  Cleared existing data
✅ Created 2 users
✅ Created 8 products
✅ Created 1 order

📝 Test Credentials:
User: john@example.com / password123
Admin: admin@example.com / admin123
```

### 5️⃣ Start Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Expected Output:
```
✅ MongoDB connected
✅ Redis connected (or: ⚠️ Running without caching)
🚀 Server running on port 5000
📍 Base URL: http://localhost:5000
```

### 6️⃣ Test API
```bash
# Health check
curl http://localhost:5000/health

# Response:
# {"success":true,"message":"API is running"}

# List products
curl http://localhost:5000/api/products/list
```

---

## 🔑 Key Endpoints

### Public Endpoints (No Auth Required)
```bash
# Register
POST http://localhost:5000/api/auth/register

# Login
POST http://localhost:5000/api/auth/login

# Browse Products
GET http://localhost:5000/api/products/list
GET http://localhost:5000/api/products/search?q=headphones
GET http://localhost:5000/api/products/PRODUCT_ID
```

### Protected Endpoints (Auth Required)
```bash
# Get Profile
GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"

# Add to Cart
POST http://localhost:5000/api/cart/add \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create Order
POST http://localhost:5000/api/orders/checkout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📱 Example: Complete User Journey

### Step 1: Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

### Step 2: Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user"
    }
  }
}
```

Save token:
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Step 3: Browse Products
```bash
curl http://localhost:5000/api/products/list
```

Response (truncated):
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Wireless Headphones",
        "price": 25000,
        "discountedPrice": 22500,
        "stock": 50,
        "category": "Electronics"
      }
    ],
    "pagination": {
      "current": 1,
      "limit": 10,
      "total": 8,
      "pages": 1
    }
  }
}
```

### Step 4: Add to Cart
```bash
curl -X POST http://localhost:5000/api/cart/add \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "507f1f77bcf86cd799439012",
    "quantity": 2
  }'
```

### Step 5: Checkout
```bash
curl -X POST http://localhost:5000/api/orders/checkout \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shippingAddress": {
      "street": "123 Main St",
      "city": "Lagos",
      "state": "Lagos",
      "zipCode": "100001",
      "country": "Nigeria"
    },
    "paymentMethod": "paystack"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "orderNumber": "ORD-1712345678-abc123def",
    "totalPrice": 48250,
    "status": "pending",
    "paymentStatus": "pending"
  }
}
```

### Step 6: Initialize Payment
```bash
curl -X POST http://localhost:5000/api/payments/initialize \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "507f1f77bcf86cd799439013",
    "email": "jane@example.com"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Payment initialized",
  "data": {
    "authorizationUrl": "https://checkout.paystack.com/...",
    "accessCode": "access_code_here",
    "reference": "reference_here"
  }
}
```

User visits the `authorizationUrl` to complete payment with test card:
- Card: 4111111111111111
- CVC: 123
- Expiry: Any future date

---

## 🛠️ Development Tips

### Use Postman for Testing
1. Download Postman from postman.com
2. Create new collection "CartFlow API"
3. Add requests for each endpoint
4. Use environment variables for token and base URL
5. Save collection for team sharing

### View Logs in Real-time
```bash
# Terminal shows logs automatically
# Look for:
# ✅ Success logs
# ❌ Error logs
# ⚠️ Warning logs
```

### Database Tools
```bash
# MongoDB Compass (GUI)
# Download: mongodb.com/try/download/compass
# Connection: Local or MongoDB Atlas

# MongoDB Shell
# mongosh "mongodb+srv://user:pass@cluster.mongodb.net/cartflow"
```

### Redis Commands (Optional)
```bash
# If using Redis locally
redis-cli

# Check cache
GET product:PRODUCT_ID

# Clear all cache
FLUSHALL

# Monitor cache hits
MONITOR
```

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to MongoDB"
**Solution:**
```bash
# Check connection string
echo $MONGODB_URI

# Verify IP is whitelisted in Atlas
# Check username/password are correct
# Ensure database user has readWrite permissions
```

### Issue: "Port 5000 already in use"
**Solution:**
```bash
# Change PORT in .env to 5001
PORT=5001

# Or kill process using port
# Windows: netstat -ano | findstr :5000
# Mac/Linux: lsof -i :5000
```

### Issue: "Email not sending"
**Solution:**
```bash
# Check Gmail credentials
# Enable "Less secure apps"
# Or use App-specific password

# Verify EMAIL_USER and EMAIL_PASSWORD in .env
```

### Issue: "Payment webhook not working"
**Solution:**
```bash
# Make sure API is publicly accessible
# Update webhook URL in Paystack dashboard
# Use ngrok for local testing:
# ngrok http 5000
# Add ngrok URL to Paystack settings
```

---

## 📚 Next Steps

1. ✅ **Get API Running** (you're here!)
2. 📖 Read [API_GUIDE.md](./docs/API_GUIDE.js) for all endpoints
3. 🧪 See [TESTING_GUIDE.md](./docs/TESTING_GUIDE.md) for testing
4. 🚀 Check [DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md) for production
5. 🏗️ Review [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for design details

---

## 🎉 You're Ready!

Your CartFlow API is now running. Start building amazing e-commerce applications! 

**Questions or issues?** Check the README.md or specific documentation files. Happy coding! 🚀
