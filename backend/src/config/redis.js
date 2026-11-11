const { createClient } = require('redis');

const redisClient = createClient(process.env.REDIS_URL
    ? { url: process.env.REDIS_URL }
    : {
        username: process.env.REDIS_USERNAME || 'default',
        password: process.env.REDIS_PASS,
        socket: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT || 6379),
        },
    }
);

redisClient.on('error', (error) => {
    console.error('Redis client error:', error.message);
});

module.exports = redisClient;
