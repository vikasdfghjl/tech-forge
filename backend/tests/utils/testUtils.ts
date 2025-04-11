import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express, { Application } from 'express';
import User from '../../models/User';
import Tool from '../../models/Tool';
import Interaction from '../../models/Interaction';
import authRoutes from '../../routes/authRoutes';
import toolRoutes from '../../routes/toolRoutes';
import interactionRoutes from '../../routes/interactionRoutes';
import { protect } from '../../middleware/auth';

export const setupTestDB = () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create({
      instance: {
        // Use a random available port instead of binding to a specific one
        port: 0,
        // Use IPv4 loopback instead of binding to all interfaces
        ip: '127.0.0.1'
      }
    });
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    // Clean all collections before each test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });
};

export const setupTestApp = (): Application => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/tools', toolRoutes);
  app.use('/api/interactions', protect, interactionRoutes);
  
  return app;
};

export const createTestUser = async (userData = {}) => {
  // Generate a unique username with a timestamp to prevent duplicate key errors
  const timestamp = Date.now();
  
  const defaultUser = {
    name: 'Test User',
    email: `test${timestamp}@example.com`,
    username: `testuser${timestamp}`,
    password: 'Password123!'
  };
  
  const user = new User({...defaultUser, ...userData});
  await user.save();
  
  return user;
};

export const createTestTool = async (userId: string, toolData = {}) => {
  const defaultTool = {
    name: 'Test Tool',
    description: 'A tool for testing',
    category: 'development',
    creator: userId // Use 'creator' instead of 'createdBy' to match the model
  };
  
  const tool = new Tool({...defaultTool, ...toolData});
  await tool.save();
  
  return tool;
};