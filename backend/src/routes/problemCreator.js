const express = require('express');

const problemRouter = express.Router();



problemRouter.post("/create",problemCreate);
problemRouter.get("/:id",problemFetch);
problemRouter.get("/",problemFetchAll);

problemRouter.patch("/:id",problemUpdate);
problemRouter.delete("/:id",problemDelete);
problemRouter.get("/user", solvedProblem);

