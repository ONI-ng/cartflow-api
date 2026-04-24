require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cartflow');
    console.log('✅ Connected to MongoDB');

    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log('🗑️ Cleared existing data');

    const users = await User.create([
      {
        name: 'John Doe',
        email: 'thepestcom@gmail.com',
        password: 'mark@242',
        role: 'user',
        isVerified: true,
        phone: '08012345678',
        address: {
          street: '123 Main St',
          city: 'Lagos',
          state: 'Lagos',
          zipCode: '100001',
          country: 'Nigeria',
        },
      },
      {
        name: 'Pskii jai',
        email: 'pskii2018@gmail.com',
        password: 'admin123',
        role: 'admin',
        isVerified: true,
      },
    ]);

    console.log(`✅ Created ${users.length} users`);

    const products = await Product.create([
      {
        name: 'Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 25000,
        category: 'Electronics',
        stock: 50,
        discount: 10,
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop'],
        tags: ['audio', 'wireless', 'electronics'],
        rating: 4.5,
        numReviews: 45,
      },
      {
        name: 'Smart Watch',
        description: 'Feature-rich smartwatch with health tracking',
        price: 35000,
        category: 'Electronics',
        stock: 30,
        discount: 5,
        images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop'],
        tags: ['wearable', 'electronics'],
        rating: 4.3,
        numReviews: 32,
      },
      {
        name: 'Running Shoes',
        description: 'Professional running shoes with comfort cushioning',
        price: 15000,
        category: 'Sports',
        stock: 100,
        discount: 15,
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop'],
        tags: ['sports', 'shoes', 'athletic'],
        rating: 4.6,
        numReviews: 78,
      },
      {
        name: 'Cotton T-Shirt',
        description: '100% organic cotton t-shirt',
        price: 5000,
        category: 'Fashion',
        stock: 200,
        discount: 0,
        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop'],
        tags: ['fashion', 'clothing'],
        rating: 4.2,
        numReviews: 56,
      },
      {
        name: 'Novel - The Alchemist',
        description: 'Bestselling novel about personal journey and dreams',
        price: 3500,
        category: 'Books',
        stock: 75,
        discount: 20,
        images: ['https://images.unsplash.com/photo-1507842217343-583f7270bfba?w=500&h=500&fit=crop'],
        tags: ['books', 'fiction'],
        rating: 4.8,
        numReviews: 120,
      },
      {
        name: 'Yoga Mat',
        description: 'Premium non-slip yoga mat',
        price: 8000,
        category: 'Sports',
        stock: 40,
        discount: 10,
        images: ['https://images.unsplash.com/photo-1506241167687-1f67a2109d2e?w=500&h=500&fit=crop'],
        tags: ['sports', 'fitness'],
        rating: 4.4,
        numReviews: 34,
      },
      {
        name: 'Coffee Maker',
        description: 'Automatic coffee maker with timer',
        price: 12000,
        category: 'Home & Garden',
        stock: 25,
        discount: 5,
        images: ['https://images.unsplash.com/photo-1517668808822-9ebb02ae2a0e?w=500&h=500&fit=crop'],
        tags: ['home', 'kitchen'],
        rating: 4.1,
        numReviews: 28,
      },
      {
        name: 'Face Wash',
        description: 'Gentle face wash for all skin types',
        price: 2500,
        category: 'Beauty',
        stock: 150,
        discount: 0,
        images: ['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop'],
        tags: ['beauty', 'skincare'],
        rating: 4.3,
        numReviews: 89,
      },
    ]);

    console.log(`✅ Created ${products.length} products`);

    const orders = await Order.create([
      {
        orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user: users[0]._id,
        items: [
          {
            product: products[0]._id,
            quantity: 1,
            price: 22500, // 25000 - 10% discount
            discount: 10,
          },
          {
            product: products[2]._id,
            quantity: 2,
            price: 12750, // 15000 - 15% discount
            discount: 15,
          },
        ],
        shippingAddress: users[0].address,
        subtotal: 47750,
        tax: 3581.25,
        shippingCost: 0,
        totalPrice: 51331.25,
        paymentMethod: 'paystack',
        paymentStatus: 'completed',
        status: 'delivered',
        paymentReference: 'PAY-TEST-001',
        trackingNumber: 'TRACK-001',
      },
    ]);

    console.log(`✅ Created ${orders.length} orders`);
    console.log('\n✨ Database seeded successfully!');
    console.log('📝 Test Credentials:');
    console.log('User: thepestcom@gmail.com / mark@242');
    console.log('Admin: pskii2018@gmail.com / admin123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
