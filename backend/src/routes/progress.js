const express = require('express');
const userMiddleware = require('../middleware/userMiddleware');
const getProgress = require('../controllers/progress');

const progressRouter = express.Router();
progressRouter.get('/', userMiddleware, getProgress);

module.exports = progressRouter;
