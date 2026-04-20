const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cartflow';

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    // Create indexes on startup
    await createIndexes();

    return conn;
  } catch (error) {
    console.error(`❌ Database connection error: ${error.message}`);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    const { default: User } = await import('./models/User.js');
    const { default: Product } = await import('./models/Product.js');
    const { default: Order } = await import('./models/Order.js');

    console.log('📑 Creating database indexes...');
    // Indexes are already defined in models
  } catch (error) {
    console.error(`⚠️ Error creating indexes: ${error.message}`);
  }
};

module.exports = connectDB;
