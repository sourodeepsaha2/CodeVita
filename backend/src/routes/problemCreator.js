const express = require('express');

const problemRouter = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const createProblem = require("../controllers/userProblem")



problemRouter.post("/create",adminMiddleware,createProblem);
problemRouter.get("/:id",updateProblem);
problemRouter.get("/",deleteProblem);

problemRouter.patch("/:id",getProblembyId);
problemRouter.delete("/:id",problemDelete);
problemRouter.get("/user", solvedProblembyUser);

module.exports = problemRouter

