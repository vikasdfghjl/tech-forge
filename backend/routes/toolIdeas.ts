import express from "express";

const toolIdeasRouter = express.Router();

// Define your routes here
toolIdeasRouter.get("/", (req, res) => {
  res.send("Tool Ideas Routes");
});

export default toolIdeasRouter;
