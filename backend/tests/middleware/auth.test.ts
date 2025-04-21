import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { protect, admin, optionalAuth } from '../../middleware/auth';
import User from '../../models/User';
import JWT_CONFIG from '../../config/jwt_config';
import { setupTestDB } from '../utils/testUtils';

describe('Auth Middleware', () => {
  setupTestDB();
  
  let mockRequest: any;
  let mockResponse: any;
  let nextFunction: jest.Mock;
  let userId: mongoose.Types.ObjectId;
  let adminUserId: mongoose.Types.ObjectId;
  let validToken: string;
  
  beforeEach(async () => {
    // Create a regular test user
    const user = new User({
      name: 'Test User',
      email: 'authtest@example.com',
      username: 'authtest',
      password: 'Password123!'
    });
    await user.save();
    userId = user._id;
    
    // Create an admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      username: 'adminuser',
      password: 'Password123!',
      role: 'admin'
    });
    await adminUser.save();
    adminUserId = adminUser._id;
    
    // Create a valid JWT token
    validToken = jwt.sign({ id: userId }, JWT_CONFIG.secret, {
      expiresIn: '1h'
    });
    
    // Mock Express request, response, and next function
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    nextFunction = jest.fn();
  });
  
  describe('protect middleware', () => {
    it('should add user to the request object if JWT token is valid (Authorization header)', async () => {
      // Setup mock request with Authorization header
      mockRequest = {
        headers: {
          authorization: `Bearer ${validToken}`
        },
        cookies: {}
      };
      
      await protect(mockRequest, mockResponse, nextFunction);
      
      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user._id.toString()).toBe(userId.toString());
      expect(mockRequest.isAuthenticated).toBe(true);
    });
    
    it('should add user to request object if JWT token is valid (cookie)', async () => {
      // Setup mock request with cookie token
      mockRequest = {
        headers: {},
        cookies: {
          [JWT_CONFIG.cookie.name]: validToken
        }
      };
      
      await protect(mockRequest, mockResponse, nextFunction);
      
      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user._id.toString()).toBe(userId.toString());
      expect(mockRequest.isAuthenticated).toBe(true);
    });
    
    it('should return 401 if no token is provided', async () => {
      // Setup mock request with no token
      mockRequest = {
        headers: {},
        cookies: {}
      };
      
      await protect(mockRequest, mockResponse, nextFunction);
      
      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        message: 'Authentication required' 
      });
    });
    
    it('should return 401 if token is invalid', async () => {
      // Setup mock request with invalid token
      mockRequest = {
        headers: {
          authorization: 'Bearer invalidtoken123'
        },
        cookies: {}
      };
      
      await protect(mockRequest, mockResponse, nextFunction);
      
      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        message: 'Authentication failed' 
      });
    });
    
    it('should return 401 if user not found', async () => {
      // Create token with non-existent user ID
      const nonExistentId = new mongoose.Types.ObjectId();
      const invalidUserToken = jwt.sign({ id: nonExistentId }, JWT_CONFIG.secret, {
        expiresIn: '1h'
      });
      
      mockRequest = {
        headers: {
          authorization: `Bearer ${invalidUserToken}`
        },
        cookies: {}
      };
      
      await protect(mockRequest, mockResponse, nextFunction);
      
      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        message: 'User not found' 
      });
    });
  });
  
  describe('admin middleware', () => {
    it('should allow access for admin users', () => {
      // Setup mock request with admin user
      mockRequest = {
        user: {
          _id: adminUserId,
          role: 'admin'
        }
      };
      
      admin(mockRequest, mockResponse, nextFunction);
      
      expect(nextFunction).toHaveBeenCalled();
    });
    
    it('should deny access for non-admin users', () => {
      // Setup mock request with regular user
      mockRequest = {
        user: {
          _id: userId,
          role: 'user'
        }
      };
      
      admin(mockRequest, mockResponse, nextFunction);
      
      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        message: 'Not authorized as admin' 
      });
    });
    
    it('should deny access if user is not authenticated', () => {
      // Setup mock request with no user
      mockRequest = {};
      
      admin(mockRequest, mockResponse, nextFunction);
      
      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        message: 'Not authorized as admin' 
      });
    });
  });
  
  describe('optionalAuth middleware', () => {
    it('should add user to request if token is valid', async () => {
      // Setup mock request with valid token
      mockRequest = {
        headers: {
          authorization: `Bearer ${validToken}`
        },
        cookies: {}
      };
      
      await optionalAuth(mockRequest, mockResponse, nextFunction);
      
      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user._id.toString()).toBe(userId.toString());
      expect(mockRequest.isAuthenticated).toBe(true);
    });
    
    it('should continue as guest when no token is provided', async () => {
      // Setup mock request with no token
      mockRequest = {
        headers: {},
        cookies: {}
      };
      
      await optionalAuth(mockRequest, mockResponse, nextFunction);
      
      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user).toBeUndefined();
      expect(mockRequest.isAuthenticated).toBeUndefined();
    });
    
    it('should continue as guest when token is invalid', async () => {
      // Setup mock request with invalid token
      mockRequest = {
        headers: {
          authorization: 'Bearer invalidtoken123'
        },
        cookies: {}
      };
      
      await optionalAuth(mockRequest, mockResponse, nextFunction);
      
      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user).toBeUndefined();
      expect(mockRequest.isAuthenticated).toBeUndefined();
    });
    
    it('should continue as guest when user not found', async () => {
      // Create token with non-existent user ID
      const nonExistentId = new mongoose.Types.ObjectId();
      const invalidUserToken = jwt.sign({ id: nonExistentId }, JWT_CONFIG.secret, {
        expiresIn: '1h'
      });
      
      mockRequest = {
        headers: {
          authorization: `Bearer ${invalidUserToken}`
        },
        cookies: {}
      };
      
      await optionalAuth(mockRequest, mockResponse, nextFunction);
      
      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user).toBeUndefined();
      expect(mockRequest.isAuthenticated).toBe(false);
    });
  });
});