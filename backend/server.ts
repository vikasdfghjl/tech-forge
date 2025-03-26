import express, { Application } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import chartRoutes from "./routes/ChartRoutes";
import toolIdeasRouter from "./routes/toolIdeas";
import toolRoutes from "./routes/toolRoutes";

dotenv.config();

if (!process.env.MONGO_URI) {
  console.error("Error: MONGO_URI is not defined in the environment variables.");
  process.exit(1); // Exit if MONGO_URI is missing
}

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware to trace requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/charts", chartRoutes);
app.use("/api/tool-ideas", toolIdeasRouter);
app.use("/api/tools", toolRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/tooltopia")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB:", err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
