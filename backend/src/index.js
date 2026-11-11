const express = require('express')
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
const main = require('./config/db')
const cookieParser = require('cookie-parser');
const authRouter = require("./routes/userAuth");
const redisClient = require('./config/redis');
const problemRouter = require("./routes/problemCreator")
const submitRouter = require('./routes/submit');


app.use(express.json());
app.use(cookieParser());

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
