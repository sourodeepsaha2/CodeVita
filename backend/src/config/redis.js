const  { createClient } = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'authentic-cows-ocean-65066.db.redis.io',
        port: 16574
    }
});

module.exports = redisClient;