import express, { Application } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import chartRoutes from "./routes/ChartRoutes";
import toolIdeasRouter from "./routes/toolIdeas";
import toolRoutes from "./routes/toolRoutes";
import authRoutes from './routes/authRoutes';
import interactionRoutes from './routes/interactionRoutes';
import cookieParser from "cookie-parser";
import connectDB from "./config/db";

dotenv.config();

const app: Application = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8080'], // Allow both origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']  // Make sure cookies can be read by the client
}));
app.use(cookieParser());  // Add cookie-parser before other middleware
app.use(express.json());

// Debug middleware to trace requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log('Cookies:', req.cookies);  // Log cookies for debugging
  next();
});

// Routes
app.use("/api/charts", chartRoutes);
app.use("/api/tool-ideas", toolIdeasRouter);
app.use("/api/tools", toolRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/interactions', interactionRoutes);

// Connect to MongoDB
connectDB().then(() => {
  console.log('MongoDB connected successfully');
  
  // Only start the server after successful DB connection
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// Add a health check route
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.status(200).json({
    status: 'ok',
    timestamp: new Date(),
    mongodb: dbStatus,
    uptime: process.uptime()
  });
});
