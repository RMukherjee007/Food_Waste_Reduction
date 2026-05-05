const redis = require('redis');
require('dotenv').config();

const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
});

client.on('error', (err) => console.error('Redis Client Error', err));
client.on('connect', () => console.log('Connected to Redis'));

// Self-invoking async function to connect
(async () => {
  try {
    await client.connect();
  } catch (err) {
    console.error('Failed to connect to Redis on startup', err);
  }
})();

module.exports = client;
