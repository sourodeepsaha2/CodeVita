const express = require('express');
const submitRouter = express.Router();
const userMiddleware = require("../middleware/userMiddleware");

submitRouter.post("/submit/:id", userMiddleware, userSubmission);