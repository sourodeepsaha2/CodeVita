const jwt = require("jsonwebtoken");
const redisClient = require('../config/redis');
const User = require('../models/user');

const adminMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token) return res.status(401).json({ error: 'Authentication required' });

        const payload = jwt.verify(token, process.env.JWT_KEY);
        if (!payload._id || payload.role !== 'admin') {
            return res.status(403).json({ error: 'Administrator access required' });
        }

        const user = await User.findById(payload._id).select('-password');
        if (!user) return res.status(401).json({ error: 'User no longer exists' });

        const isBlocked = await redisClient.exists(`token:${token}`);
        if (isBlocked) return res.status(401).json({ error: 'Session has expired' });

        req.result = user;
        return next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid session' });
    }
};

module.exports = adminMiddleware;
