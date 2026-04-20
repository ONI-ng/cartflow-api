const redis = require('redis');

let client = null;

const initializeRedis = async () => {
  try {
    // Only initialize Redis if REDIS_URL is explicitly set
    if (!process.env.REDIS_URL) {
      console.log('⚠️  Redis not configured, caching disabled');
      return null;
    }

    client = redis.createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
      },
    });

    client.on('error', (err) => console.error('❌ Redis error:', err.message));
    client.on('connect', () => console.log('✅ Redis connected'));

    await client.connect();
    return client;
  } catch (error) {
    console.error(`⚠️  Redis initialization failed (non-critical): ${error.message}`);
    console.log('⚠️ Running without caching');
    return null;
  }
};

const cacheGet = async (key) => {
  if (!client) return null;
  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Cache get error: ${error.message}`);
    return null;
  }
};

const cacheSet = async (key, value, expirySeconds = 3600) => {
  if (!client) return false;
  try {
    await client.setEx(key, expirySeconds, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Cache set error: ${error.message}`);
    return false;
  }
};

const cacheDelete = async (key) => {
  if (!client) return false;
  try {
    await client.del(key);
    return true;
  } catch (error) {
    console.error(`Cache delete error: ${error.message}`);
    return false;
  }
};

const cacheClear = async (pattern) => {
  if (!client) return false;
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
    return true;
  } catch (error) {
    console.error(`Cache clear error: ${error.message}`);
    return false;
  }
};

module.exports = {
  initializeRedis,
  cacheGet,
  cacheSet,
  cacheDelete,
  cacheClear,
  getClient: () => client,
};
