# CartFlow E-Commerce API

A production-grade e-commerce backend API built with Node.js, Express, MongoDB, and integrated with Paystack for payments.

## 🚀 Features

✅ **Authentication & Authorization**
- JWT-based authentication with refresh tokens
- Email verification with Nodemailer
- Password reset functionality
- Role-based access control (User/Admin)

✅ **Product Management**
- CRUD operations for products
- Advanced filtering and pagination
- Full-text search
- Category-based browsing
- MongoDB text indexes for performance

✅ **Shopping Cart**
- Add/remove products
- Update quantities
- Automatic price calculation (with discounts & tax)
- Promo code support
- Real-time inventory check

✅ **Order Management**
- Create orders from cart
- Track order status
- Order history
- Automatic email notifications

✅ **Payment Integration**
- Paystack integration (Naira payments)
- Payment verification
- Refund processing
- Webhook support

✅ **Advanced Features**
- Redis caching for performance
- MongoDB aggregation pipelines
- Sales analytics
- Email notifications
- Rate limiting
- Security headers (Helmet)
- Input validation (Joi)

## 📋 Requirements

- Node.js (v14+)
- MongoDB (Atlas or local)
- Redis (optional for caching)
- Paystack Account (for payments)

## 🔧 Installation

1. **Clone the repository**
```bash
git clone <repo-url>
cd cartflow-api
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/cartflow
PORT=5000
JWT_SECRET=your_secret_key
PAYSTACK_SECRET_KEY=sk_test_xxx
PAYSTACK_PUBLIC_KEY=pk_test_xxx
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=app_specific_password
REDIS_URL=redis://localhost:6379
```

4. **Seed the database**
```bash
npm run seed
```

5. **Start the server**
```bash
npm run dev  # Development with nodemon
npm start    # Production
```

Server will run on `http://localhost:5000`

## 📚 API Endpoints

### Authentication
```
POST   /api/auth/register           - Register new user
POST   /api/auth/login              - Login user
GET    /api/auth/verify-email       - Verify email
POST   /api/auth/request-password-reset - Request password reset
POST   /api/auth/reset-password     - Reset password
GET    /api/auth/profile            - Get user profile
PUT    /api/auth/profile            - Update profile
POST   /api/auth/logout             - Logout
```

### Products
```
GET    /api/products/list           - List products (paginated)
GET    /api/products/search         - Search products
GET    /api/products/category/:name - Get by category
GET    /api/products/top-selling    - Top selling products
GET    /api/products/:id            - Get product details
POST   /api/products/create         - Create product (Admin)
PUT    /api/products/:id            - Update product (Admin)
DELETE /api/products/:id            - Delete product (Admin)
GET    /api/products/analytics/overview - Products analytics (Admin)
```

### Cart
```
GET    /api/cart                    - Get cart
POST   /api/cart/add                - Add to cart
PUT    /api/cart/item/:productId    - Update cart item
DELETE /api/cart/item/:productId    - Remove from cart
DELETE /api/cart                    - Clear cart
GET    /api/cart/summary            - Cart summary
POST   /api/cart/apply-promo        - Apply promo code
```

### Orders
```
POST   /api/orders/checkout         - Create order
GET    /api/orders/my-orders        - User orders
GET    /api/orders/:id              - Order details
POST   /api/orders/confirm-payment  - Confirm payment
GET    /api/orders                  - All orders (Admin)
PUT    /api/orders/:id/status       - Update status (Admin)
GET    /api/orders/analytics/sales  - Sales analytics (Admin)
```

### Payments
```
POST   /api/payments/initialize     - Initialize payment
POST   /api/payments/webhook/verify - Webhook (Paystack)
GET    /api/payments/status/:ref    - Payment status
POST   /api/payments/refund         - Refund order
```

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: "user" | "admin",
  isVerified: Boolean,
  totalOrders: Number,
  totalSpent: Number,
  address: {
    street, city, state, zipCode, country
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Products Collection
```javascript
{
  _id: ObjectId,
  name: String (unique, text indexed),
  description: String,
  price: Number,
  category: String,
  stock: Number,
  images: [String],
  discount: Number,
  discountedPrice: Number,
  rating: Number,
  numReviews: Number,
  salesCount: Number,
  tags: [String],
  isActive: Boolean,
  createdAt: Date
}
```

### Orders Collection
```javascript
{
  _id: ObjectId,
  orderNumber: String (unique),
  user: ObjectId (ref: User),
  items: [{
    product: ObjectId (ref: Product),
    quantity: Number,
    price: Number,
    discount: Number
  }],
  totalPrice: Number,
  status: "pending" | "paid" | "shipped" | "delivered",
  paymentStatus: "pending" | "completed" | "failed",
  paymentMethod: String,
  paymentReference: String,
  shippingAddress: { street, city, state, zipCode, country },
  createdAt: Date
}
```

## 🔐 Security Features

✅ Password hashing with bcryptjs
✅ JWT token-based authentication
✅ Rate limiting on sensitive endpoints
✅ CORS configuration
✅ Security headers with Helmet
✅ Input validation with Joi
✅ SQL injection prevention
✅ Protected admin routes

## 🏗️ Folder Structure

```
src/
├── config/              # Configuration files
│   ├── database.js
│   ├── email.js
│   ├── paystack.js
│   └── redis.js
├── controllers/         # Request handlers
├── middleware/          # Custom middleware
├── models/             # Mongoose schemas
├── routes/             # API routes
├── services/           # Business logic
└── index.js           # App entry point

scripts/
├── seedDatabase.js     # Database seeding

.env.example           # Environment variables template
package.json
README.md
```

## 📈 MongoDB Best Practices Implemented

✅ **Indexes** - Text indexes on products, unique indexes on emails
✅ **Aggregation Pipelines** - Used for analytics and reporting
✅ **Document Referencing** - Proper ObjectId references between collections
✅ **Pagination** - Limit/skip for large datasets
✅ **Data Validation** - Schema-level validation with Mongoose
✅ **Relationships** - Proper one-to-many and one-to-one relationships

### Example Aggregation: Top Selling Products
```javascript
db.products.aggregate([
  { $match: { isActive: true } },
  { $sort: { salesCount: -1 } },
  { $limit: 10 },
  {
    $project: {
      name: 1,
      price: 1,
      salesCount: 1,
      category: 1
    }
  }
])
```

### Example Aggregation: Sales Analytics
```javascript
db.orders.aggregate([
  {
    $match: {
      createdAt: { $gte: ISODate("2024-01-01") },
      paymentStatus: "completed"
    }
  },
  {
    $facet: {
      totalRevenue: [
        {
          $group: {
            _id: null,
            total: { $sum: "$totalPrice" }
          }
        }
      ],
      byDate: [
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$totalPrice" }
          }
        }
      ]
    }
  }
])
```

## 💰 Paystack Integration

### Setup
1. Create Paystack account at https://dashboard.paystack.com
2. Get your Secret Key and Public Key
3. Add to `.env` file

### Payment Flow
1. User adds products to cart
2. Checkout creates order (status: pending)
3. Initialize payment endpoint gets authorization URL
4. User redirected to Paystack
5. After payment, Paystack sends webhook
6. Webhook verifies and updates order
7. Stock reduced, confirmation email sent

### Test Cards
```
Visa: 4111111111111111
CVC: 123
Expiry: Any future date
```

## 🚀 Deployment

### Deploy to Render

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repository
4. Set environment variables
5. Deploy

### Deploy to Railway

1. Connect GitHub account
2. Create new project
3. Add MongoDB Atlas variable
4. Add environment variables
5. Deploy

### Environment Setup

```env
# Production
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=long_random_string
CORS_ORIGIN=https://yourdomain.com
```

## 📞 Support & Contact

For issues, questions, or contributions, please open an issue on GitHub.

## 📄 License

MIT License - Feel free to use this project!

## 🎯 Next Steps to Enhance

- [ ] Add product reviews and ratings
- [ ] Implement wishlist feature
- [ ] Add user notifications system
- [ ] Create admin dashboard
- [ ] Implement inventory alerts
- [ ] Add customer support chat
- [ ] Create mobile app integration
- [ ] Add advanced analytics
- [ ] Implement recommendation engine
- [ ] Add subscription model

---

**Built with ❤️ for e-commerce success**
