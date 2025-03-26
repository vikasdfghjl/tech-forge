import express from "express";

const chartRoutes = express.Router();

// Define your routes here
chartRoutes.get("/", (req, res) => {
  res.send("Chart Routes");
});

export default chartRoutes;
