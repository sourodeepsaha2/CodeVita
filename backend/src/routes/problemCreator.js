const express = require('express');

const problemRouter = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");



problemRouter.post("/create",adminMiddleware,createProblem);
problemRouter.get("/:id",updateProblem);
problemRouter.get("/",DeleteProblem);

problemRouter.patch("/:id",getProblembyId);
problemRouter.delete("/:id",problemDelete);
problemRouter.get("/user", solvedProblembyUser);

