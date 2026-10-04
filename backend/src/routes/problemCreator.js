const express = require('express');

const problemRouter = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");



problemRouter.post("/create",createProblem);
problemRouter.get("/:id",updateProblem);
problemRouter.get("/",deleteProblem);

problemRouter.patch("/:id",getProblembyId);
problemRouter.delete("/:id",problemDelete);
problemRouter.get("/user", solvedProblembyUser);

