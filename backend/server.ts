import express, { Application, Request, Response, NextFunction } from "express";
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

// Export app for testing purposes
export const app: Application = express();

// Global route error handler to catch and log errors during route registration
const originalUse = app.use.bind(app);
app.use = function(path: string | RegExp | express.RequestHandler, ...handlers: express.RequestHandler[]) {
  console.log(`Registering route handler for ${typeof path === 'string' ? path : '/'}`);
  
  handlers.forEach((handler, index) => {
    if (handler === undefined) {
      console.error(`ERROR: Handler #${index} for path ${path} is undefined!`);
      console.trace();
      process.exit(1); // Exit with error to prevent starting with broken routes
    }
  });
  
  // Handle function overloads correctly
  if (typeof path === 'function') {
    return originalUse(path, ...handlers);
  } else {
    return originalUse(path as string | RegExp, ...handlers);
  }
} as typeof app.use;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8080'], // Allow both origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],  // Make sure cookies can be read by the client
  maxAge: 86400 // Cache preflight requests for 24 hours
}));
app.use(cookieParser());  // Add cookie-parser before other middleware
app.use(express.json());

// Debug middleware to trace requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log('Cookies:', req.cookies);  // Log cookies for debugging
  next();
});

// Enhanced error tracking for route registration
console.log('==== REGISTERING ROUTES ====');

try {
  // Routes
  console.log('Registering chart routes...');
  app.use("/api/charts", chartRoutes);
  
  console.log('Registering tool ideas routes...');
  app.use("/api/tool-ideas", toolIdeasRouter);
  
  console.log('Registering tool routes...');
  app.use("/api/tools", toolRoutes);
  
  console.log('Registering auth routes...');
  app.use('/api/auth', authRoutes);
  
  console.log('Registering interaction routes...');
  app.use('/api/interactions', interactionRoutes);
  
  console.log('==== ALL ROUTES REGISTERED SUCCESSFULLY ====');
} catch (error) {
  console.error('ERROR REGISTERING ROUTES:', error);
  process.exit(1);
}

// Error handler middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Connect to MongoDB
connectDB().then(() => {
  console.log('MongoDB connected successfully');
  
  // Only start the server if it's not being imported for testing
  if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  }
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
