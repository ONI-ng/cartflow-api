# CartFlow API - Architecture & Design Document

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT APPLICATIONS                      │
│              (Web, Mobile, Admin Dashboard)                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                ┌────▼─────────┐
                │   API SERVER  │         Express.js
                │  (Cartflow)   │──────── Node.js
                └────┬─────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
    ┌───▼───┐   ┌───▼───┐   ┌───▼────┐
    │MongoDB │   │ Redis │   │Paystack│
    │(Data) │   │ Cache │   │Payment │
    └────────┘   └───────┘   └────────┘
```

## 📊 Database Design (MongoDB)

### Collections Hierarchy

```
Users (Authentication & Profile)
├── Email (Unique Index)
├── Orders (One-to-Many Reference)
├── Cart (One-to-One Relationship)
└── Reviews (Embedded or Reference)

Products (Catalog)
├── Name (Text Index)
├── Category (Index)
├── Stock (Managed Inventory)
└── Reviews (Reference)

Orders (Transactions)
├── User (Reference - Foreign Key)
├── Items (Array of References)
│   └── Product (Reference)
├── Status (Index)
└── PaymentReference (Unique Index)

Cart (Shopping Session)
├── User (Unique Index)
└── Items (Array of Products)
```

### Index Strategy

```javascript
// Performance Indexes
db.users.createIndex({ email: 1 })
db.users.createIndex({ createdAt: -1 })
db.users.createIndex({ totalSpent: -1 })

db.products.createIndex({ category: 1, price: 1 })
db.products.createIndex({ name: "text", description: "text" })
db.products.createIndex({ isActive: 1, stock: 1 })
db.products.createIndex({ salesCount: -1 })

db.orders.createIndex({ user: 1, createdAt: -1 })
db.orders.createIndex({ status: 1 })
db.orders.createIndex({ paymentStatus: 1 })
db.orders.createIndex({ createdAt: -1 })

db.cart.createIndex({ user: 1 }, { unique: true })
```

## 🎯 API Layer Architecture

### Request-Response Flow

```
Request
   │
   ▼
Rate Limiter (middleware/rateLimiter.js)
   │
   ▼
Validation (middleware/validation.js)
   │
   ▼
Authentication (middleware/auth.js)
   │
   ▼
Authorization (middleware/auth.js)
   │
   ▼
Business Logic (services/*.js)
   │
   ├─▶ Database Operations (models/*.js)
   ├─▶ External APIs (config/paystack.js)
   ├─▶ Email Service (config/email.js)
   └─▶ Cache Layer (config/redis.js)
   │
   ▼
Error Handling (middleware/errorHandler.js)
   │
   ▼
Response
```

## 🔄 Service Layer Design

### UserService
- User registration & email verification
- Authentication (login/logout)
- Password reset
- Profile management
- User analytics

### ProductService
- CRUD operations for products
- Advanced search & filtering
- Category browsing
- Stock management
- Product analytics
- Top selling products aggregation

### CartService
- Add/remove items
- Quantity updates
- Cart calculations (subtotal, tax, shipping)
- Promo code handling

### OrderService
- Order creation from cart
- Payment confirmation
- Stock reduction
- Order status tracking
- Email notifications
- Sales analytics

### PaymentService (Paystack)
- Payment initialization
- Payment verification
- Refund processing
- Transaction details retrieval

## 🔐 Security Architecture

### Authentication Flow
```
Login Request
   │
   ▼
Email & Password Validation
   │
   ▼
Password Comparison (bcryptjs)
   │
   ▼
JWT Token Generation
   │
   ├─▶ JWT_SECRET + Expiry
   └─▶ User ID & Role
   │
   ▼
Token Storage (Client-side)
   │
   ▼
Subsequent Requests
   │
   ├─▶ Bearer Token in Header
   └─▶ JWT Verification
   │
   ▼
User Context Available
```

### Data Protection
- Passwords: bcryptjs with 10 salt rounds
- Sensitive data: Not included in responses
- API Key: Environment variables
- CORS: Origin whitelisting
- Rate limiting: Per IP and endpoint
- Input validation: Joi schemas
- Security headers: Helmet.js

## ⚡ Caching Strategy

### Cache Layers

```
L1: Redis Cache
├─ Products (30 mins)
├─ Search Results (15 mins)
├─ User Cart (1 hour)
└─ Analytics (1 hour)

L2: Database Indexes
├─ Text indexes for search
└─ Compound indexes for filters

L3: In-Memory (Optional)
└─ LRU cache for hot data
```

### Cache Invalidation
```
Product Updated
   │
   ▼
Clear: products:* cache keys
Clear: analytics:* cache keys
Clear: search:* cache keys
```

## 📈 Scalability Design

### Horizontal Scaling
- Stateless API servers
- Redis for distributed caching
- MongoDB Atlas for scalable database
- Load balancing (Render/Railway)

### Vertical Scaling
- Increase server memory/CPU
- Database connection pooling
- Query optimization
- Index tuning

### Performance Optimization
```javascript
// Aggregation Pipeline Example
db.orders.aggregate([
  { $match: { status: "paid" } },
  { $group: { _id: "$category", total: { $sum: "$price" } } },
  { $sort: { total: -1 } },
  { $limit: 10 }
])

// Benefits:
// - Server-side filtering
// - Reduced data transfer
// - Optimized queries
```

## 🔌 Integration Points

### External Services

```
CartFlow API
├─ MongoDB Atlas
│  └─ Cloud database
├─ Redis
│  └─ Distributed cache
├─ Paystack
│  ├─ Payment processing
│  ├─ Webhook verification
│  └─ Refund management
└─ Email Service
   ├─ Nodemailer
   ├─ User notifications
   └─ Admin alerts
```

## 🚀 Deployment Architecture

### Local Development
```
localhost:5000
├─ MongoDB (local or Atlas)
├─ Redis (local or optional)
└─ Paystack (test keys)
```

### Production (Render/Railway)
```
cartflow-api.onrender.com
├─ MongoDB Atlas (cloud)
├─ Redis Cloud (optional)
├─ Paystack (live keys)
├─ SSL/TLS (automatic)
└─ Load Balancing (automatic)
```

## 📊 Data Flow Examples

### User Registration Flow
```
POST /api/auth/register
│
▼
Validation (Joi)
│
▼
Check Existing Email
│
├─ Exists → 409 Conflict
└─ New → Continue
│
▼
Hash Password (bcryptjs)
│
▼
Create User Document
│
▼
Generate Verification Token
│
▼
Send Verification Email
│
▼
200 Response + User ID
```

### Purchase Flow
```
POST /api/orders/checkout
│
▼
Authenticate User
│
▼
Get Cart Items
│
▼
Validate Stock
│
├─ Insufficient → 400 Error
└─ Available → Continue
│
▼
Calculate Totals (Subtotal + Tax + Shipping)
│
▼
Create Order Document
│
▼
Initialize Paystack Payment
│
▼
Return Authorization URL
│
▼
User Completes Payment
│
▼
Paystack Webhook
│
▼
Verify Payment
│
▼
Update Order Status
│
▼
Reduce Stock
│
▼
Clear Cart
│
▼
Send Confirmation Email
│
▼
Update User Stats (totalOrders, totalSpent)
```

### Analytics Flow
```
GET /api/orders/analytics/sales?startDate=...&endDate=...
│
▼
Authenticate + Authorize (Admin)
│
▼
Check Cache
│
├─ Hit → Return Cached Data
└─ Miss → Execute Aggregation
│
▼ Aggregation Pipeline
[
  { $match: { paymentStatus: "completed" } },
  { $facet: {
      totalRevenue: [{ $group: { _id: null, total: { $sum: "$totalPrice" } } }],
      byDate: [{ $group: { _id: date, revenue: { $sum: "$totalPrice" } } }],
      topProducts: [{ $unwind: "$items" }, { $group: { _id: "$items.product", ... } }]
    }
  }
]
│
▼
Cache Result (1 hour)
│
▼
Return Analytics Data
```

## 🔄 Error Handling Strategy

### Error Hierarchy
```
API Error
├─ Validation Error (400)
├─ Authentication Error (401)
├─ Authorization Error (403)
├─ Not Found Error (404)
├─ Conflict Error (409)
├─ Rate Limit Error (429)
└─ Server Error (500)

All errors include:
├─ status code
├─ message
├─ error codes (for frontend)
└─ stack trace (development only)
```

## 📝 Monitoring & Logging

### Metrics to Track
- Request count & response times
- Error rates by endpoint
- Database query performance
- Cache hit/miss ratio
- Payment success rate
- Email delivery rate

### Log Levels
```
ERROR:   Critical failures
WARN:    Potential issues
INFO:    Important events
DEBUG:   Detailed information
```

---

**This architecture ensures scalability, security, and maintainability!** 🚀
