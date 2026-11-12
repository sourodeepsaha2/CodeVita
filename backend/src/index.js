const express = require('express')
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
const main = require('./config/db')
const cookieParser = require('cookie-parser');
const authRouter = require("./routes/userAuth");
const redisClient = require('./config/redis');
const User = require('./models/user');
const problemRouter = require("./routes/problemCreator")
const submitRouter = require('./routes/submit');


app.use(express.json());
app.use(cookieParser());

const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use((req, res, next) => {
    const origin = req.get('origin');
    if (origin === frontendOrigin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Vary', 'Origin');
    }
    if (req.method === 'OPTIONS') {
        if (origin !== frontendOrigin) return res.sendStatus(403);
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
        return res.sendStatus(204);
    }
    return next();
});

app.get('/health', (_req, res) => {
    const databaseReady = mongoose.connection.readyState === 1;
    const redisReady = redisClient.isReady;
    const ready = databaseReady && redisReady;
    res.status(ready ? 200 : 503).json({
        status: ready ? 'ok' : 'starting',
        checks: { database: databaseReady, redis: redisReady },
    });
});

app.use('/user',authRouter);
app.use('/problem',problemRouter);
app.use('/submission',submitRouter);

const startServer = async () => {
    const port = Number(process.env.PORT) || 3000;

    try {
        if (!process.env.DB_CONNECT_STRING) throw new Error('DB_CONNECT_STRING is required');
        if (!process.env.JWT_KEY) throw new Error('JWT_KEY is required');

        await main();
        await User.init();
        const indexes = await User.collection.indexes();
        const legacySolvedIndex = indexes.find((index) => index.unique && index.key?.problemSolved);
        if (legacySolvedIndex) {
            await User.collection.dropIndex(legacySolvedIndex.name);
            console.log('Removed obsolete unique index from solved problems.');
        }
        await redisClient.connect();
        app.listen(port, '0.0.0.0', () => {
            console.log(`Code Vita API listening on port ${port}`);
        });
    } catch (error) {
        console.error('Code Vita API failed to start:', error.message);
        if (redisClient.isOpen) redisClient.destroy();
        await mongoose.disconnect().catch(() => {});
        process.exitCode = 1;
    }
};

startServer();
