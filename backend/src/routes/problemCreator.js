const express = require('express');

const problemRouter = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const {createProblem,updateProblem,deleteProblem} = require("../controllers/userProblem");
const userMiddleware = require("../middleware/userMiddleware");



problemRouter.post("/create",adminMiddleware,createProblem);
problemRouter.put("/update/:id",adminMiddleware,updateProblem);
problemRouter.delete("/delete/:id",adminMiddleware,deleteProblem);

problemRouter.get("/problemById/:id",userMiddleware,getProblembyId);
problemRouter.get("/getAllProblem",userMiddleware,getAllProblem);
problemRouter.get("/problemSolvedByuser",userMiddleware, solvedAllProblembyUser);

module.exports = problemRouter

