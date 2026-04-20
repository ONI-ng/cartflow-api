/**
 * API TESTING GUIDE - CartFlow E-Commerce API
 * 
 * Base URL: http://localhost:5000/api
 * 
 * Environment Variables to set:
 * - base_url: http://localhost:5000/api
 * - token: JWT token from login response
 * - userId: User ID from login response
 * - productId: Product ID from list products
 * - orderId: Order ID from create order
 */

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

/**
 * 1. REGISTER USER
 * POST /auth/register
 * 
 * Body:
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "password": "password123",
 *   "confirmPassword": "password123"
 * }
 * 
 * Response: 201
 * {
 *   "success": true,
 *   "message": "Registration successful",
 *   "data": {
 *     "id": "...",
 *     "name": "John Doe",
 *     "email": "john@example.com"
 *   }
 * }
 */

/**
 * 2. LOGIN USER
 * POST /auth/login
 * 
 * Body:
 * {
 *   "email": "john@example.com",
 *   "password": "password123"
 * }
 * 
 * Response: 200
 * {
 *   "success": true,
 *   "message": "Login successful",
 *   "data": {
 *     "token": "eyJhbGc...",
 *     "user": {
 *       "id": "...",
 *       "name": "John Doe",
 *       "email": "john@example.com",
 *       "role": "user"
 *     }
 *   }
 * }
 */

/**
 * 3. VERIFY EMAIL
 * GET /auth/verify-email?token=TOKEN_FROM_EMAIL
 * 
 * Response: 200
 * {
 *   "success": true,
 *   "message": "Email verified successfully"
 * }
 */

/**
 * 4. GET USER PROFILE
 * GET /auth/profile
 * Headers: Authorization: Bearer TOKEN
 * 
 * Response: 200
 * {
 *   "success": true,
 *   "data": {
 *     "_id": "...",
 *     "name": "John Doe",
 *     "email": "john@example.com",
 *     "role": "user",
 *     "isVerified": true,
 *     "totalOrders": 5,
 *     "totalSpent": 150000
 *   }
 * }
 */

/**
 * 5. UPDATE USER PROFILE
 * PUT /auth/profile
 * Headers: Authorization: Bearer TOKEN
 * 
 * Body:
 * {
 *   "name": "Jane Doe",
 *   "phone": "08012345678",
 *   "address": {
 *     "street": "123 Main St",
 *     "city": "Lagos",
 *     "state": "Lagos",
 *     "zipCode": "100001",
 *     "country": "Nigeria"
 *   }
 * }
 */

// ============================================
// PRODUCTS ENDPOINTS
// ============================================

/**
 * 1. LIST PRODUCTS
 * GET /products/list?page=1&limit=10&category=Electronics&minPrice=0&maxPrice=100000&inStock=true
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 * - category: Product category (optional)
 * - minPrice: Minimum price (optional)
 * - maxPrice: Maximum price (optional)
 * - inStock: Filter by stock availability (optional)
 * 
 * Response: 200
 * {
 *   "success": true,
 *   "data": {
 *     "products": [
 *       {
 *         "_id": "...",
 *         "name": "Wireless Headphones",
 *         "price": 25000,
 *         "discountedPrice": 22500,
 *         "stock": 50,
 *         "category": "Electronics",
 *         "rating": 4.5
 *       }
 *     ],
 *     "pagination": {
 *       "current": 1,
 *       "limit": 10,
 *       "total": 50,
 *       "pages": 5
 *     }
 *   }
 * }
 */

/**
 * 2. SEARCH PRODUCTS
 * GET /products/search?q=headphones&page=1&limit=10
 * 
 * Query Parameters:
 * - q: Search query (required)
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 */

/**
 * 3. GET PRODUCT BY ID
 * GET /products/PRODUCT_ID
 * 
 * Response: 200
 * {
 *   "success": true,
 *   "data": {
 *     "_id": "...",
 *     "name": "Wireless Headphones",
 *     "description": "...",
 *     "price": 25000,
 *     "discountedPrice": 22500,
 *     "category": "Electronics",
 *     "stock": 50,
 *     "images": ["url1", "url2"],
 *     "rating": 4.5,
 *     "numReviews": 45
 *   }
 * }
 */

/**
 * 4. GET PRODUCTS BY CATEGORY
 * GET /products/category/Electronics?page=1&limit=10
 */

/**
 * 5. GET TOP SELLING PRODUCTS
 * GET /products/top-selling?limit=10
 */

/**
 * 6. CREATE PRODUCT (ADMIN ONLY)
 * POST /products/create
 * Headers: Authorization: Bearer ADMIN_TOKEN
 * 
 * Body:
 * {
 *   "name": "New Headphones",
 *   "description": "Amazing headphones with noise cancellation",
 *   "price": 30000,
 *   "category": "Electronics",
 *   "stock": 100,
 *   "discount": 10,
 *   "images": ["url1", "url2"],
 *   "tags": ["audio", "wireless"]
 * }
 */

// ============================================
// CART ENDPOINTS
// ============================================

/**
 * 1. GET CART
 * GET /cart
 * Headers: Authorization: Bearer TOKEN
 * 
 * Response: 200
 * {
 *   "success": true,
 *   "data": {
 *     "user": "USER_ID",
 *     "items": [
 *       {
 *         "product": "PRODUCT_ID",
 *         "quantity": 2
 *       }
 *     ],
 *     "subtotal": 50000,
 *     "tax": 3750,
 *     "shippingCost": 500,
 *     "total": 54250
 *   }
 * }
 */

/**
 * 2. ADD TO CART
 * POST /cart/add
 * Headers: Authorization: Bearer TOKEN
 * 
 * Body:
 * {
 *   "productId": "PRODUCT_ID",
 *   "quantity": 2
 * }
 */

/**
 * 3. UPDATE CART ITEM
 * PUT /cart/item/PRODUCT_ID
 * Headers: Authorization: Bearer TOKEN
 * 
 * Body:
 * {
 *   "quantity": 5
 * }
 */

/**
 * 4. REMOVE FROM CART
 * DELETE /cart/item/PRODUCT_ID
 * Headers: Authorization: Bearer TOKEN
 */

/**
 * 5. CLEAR CART
 * DELETE /cart
 * Headers: Authorization: Bearer TOKEN
 */

/**
 * 6. GET CART SUMMARY
 * GET /cart/summary
 * Headers: Authorization: Bearer TOKEN
 */

/**
 * 7. APPLY PROMO CODE
 * POST /cart/apply-promo
 * Headers: Authorization: Bearer TOKEN
 * 
 * Body:
 * {
 *   "promoCode": "SAVE10"
 * }
 */

// ============================================
// ORDERS ENDPOINTS
// ============================================

/**
 * 1. CHECKOUT / CREATE ORDER
 * POST /orders/checkout
 * Headers: Authorization: Bearer TOKEN
 * 
 * Body:
 * {
 *   "shippingAddress": {
 *     "street": "123 Main St",
 *     "city": "Lagos",
 *     "state": "Lagos",
 *     "zipCode": "100001",
 *     "country": "Nigeria"
 *   },
 *   "paymentMethod": "paystack"
 * }
 * 
 * Response: 201
 * {
 *   "success": true,
 *   "message": "Order created successfully",
 *   "data": {
 *     "_id": "ORDER_ID",
 *     "orderNumber": "ORD-...",
 *     "totalPrice": 54250,
 *     "status": "pending",
 *     "paymentStatus": "pending"
 *   }
 * }
 */

/**
 * 2. GET USER'S ORDERS
 * GET /orders/my-orders?page=1&limit=10
 * Headers: Authorization: Bearer TOKEN
 */

/**
 * 3. GET ORDER DETAILS
 * GET /orders/ORDER_ID
 * Headers: Authorization: Bearer TOKEN
 */

/**
 * 4. CONFIRM PAYMENT
 * POST /orders/confirm-payment
 * Headers: Authorization: Bearer TOKEN
 * 
 * Body:
 * {
 *   "orderId": "ORDER_ID",
 *   "paymentReference": "PAYSTACK_REFERENCE",
 *   "paymentStatus": "completed"
 * }
 */

/**
 * 5. GET ALL ORDERS (ADMIN ONLY)
 * GET /orders?page=1&limit=10&status=paid&paymentStatus=completed
 * Headers: Authorization: Bearer ADMIN_TOKEN
 */

/**
 * 6. UPDATE ORDER STATUS (ADMIN ONLY)
 * PUT /orders/ORDER_ID/status
 * Headers: Authorization: Bearer ADMIN_TOKEN
 * 
 * Body:
 * {
 *   "status": "shipped",
 *   "trackingNumber": "TRACK-12345"
 * }
 */

// ============================================
// PAYMENT ENDPOINTS
// ============================================

/**
 * 1. INITIALIZE PAYMENT
 * POST /payments/initialize
 * Headers: Authorization: Bearer TOKEN
 * 
 * Body:
 * {
 *   "orderId": "ORDER_ID",
 *   "email": "user@example.com"
 * }
 * 
 * Response: 200
 * {
 *   "success": true,
 *   "message": "Payment initialized",
 *   "data": {
 *     "authorizationUrl": "https://checkout.paystack.com/...",
 *     "accessCode": "...",
 *     "reference": "..."
 *   }
 * }
 */

/**
 * 2. REFUND PAYMENT
 * POST /payments/refund
 * Headers: Authorization: Bearer TOKEN
 * 
 * Body:
 * {
 *   "orderId": "ORDER_ID",
 *   "amount": 54250
 * }
 */

/**
 * 3. GET PAYMENT STATUS
 * GET /payments/status/PAYSTACK_REFERENCE
 * Headers: Authorization: Bearer TOKEN
 */

// ============================================
// TEST USER CREDENTIALS
// ============================================

/**
 * User:
 * Email: john@example.com
 * Password: password123
 * 
 * Admin:
 * Email: admin@example.com
 * Password: admin123
 */

// ============================================
// ERROR RESPONSES
// ============================================

/**
 * 400 - Bad Request
 * {
 *   "success": false,
 *   "message": "Validation error",
 *   "errors": ["Field is required"]
 * }
 * 
 * 401 - Unauthorized
 * {
 *   "success": false,
 *   "message": "Authentication required"
 * }
 * 
 * 403 - Forbidden
 * {
 *   "success": false,
 *   "message": "Unauthorized. Required role: admin"
 * }
 * 
 * 404 - Not Found
 * {
 *   "success": false,
 *   "message": "Product not found"
 * }
 * 
 * 429 - Too Many Requests
 * {
 *   "success": false,
 *   "message": "Too many requests from this IP, please try again later"
 * }
 * 
 * 500 - Server Error
 * {
 *   "success": false,
 *   "message": "Internal Server Error"
 * }
 */
