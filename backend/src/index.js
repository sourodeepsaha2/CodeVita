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

const InitializeConnection = async ()=>{

    try{
        await Promise.all([main(),redisClient.connect()]);
        console.log("DB Connected");

        app.listen(process.env.PORT, ()=>{
         console.log("Server listening at port number: " + process.env.PORT);
        })
    }
    catch(err){
        console.log("Error: "+err);
    }

}
InitializeConnection();

