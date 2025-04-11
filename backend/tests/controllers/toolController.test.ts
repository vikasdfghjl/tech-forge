import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { setupTestDB, setupTestApp, createTestUser, createTestTool } from '../utils/testUtils';
import User from '../../models/User';
import Tool from '../../models/Tool';

const app = setupTestApp();

describe('Tool Controller', () => {
  setupTestDB();
  
  let testUser: any;
  let authToken: string;
  
  beforeEach(async () => {
    // Create a test user and generate auth token
    testUser = await createTestUser();
    authToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET || 'default_secret', {
      expiresIn: '1h'
    });
  });

  describe('GET /api/tools', () => {
    it('should retrieve all tools', async () => {
      // Create a few sample tools
      await createTestTool(testUser._id, { name: 'Tool 1' });
      await createTestTool(testUser._id, { name: 'Tool 2' });
      
      const response = await request(app)
        .get('/api/tools')
        .expect(200);
        
      expect(response.body).toHaveProperty('tools');
      expect(Array.isArray(response.body.tools)).toBeTruthy();
      expect(response.body.tools.length).toBe(2);
    });
    
    it('should filter tools by category', async () => {
      await createTestTool(testUser._id, { name: 'Dev Tool', category: 'development' });
      await createTestTool(testUser._id, { name: 'Design Tool', category: 'design' });
      
      const response = await request(app)
        .get('/api/tools?category=design')
        .expect(200);
        
      expect(response.body.tools.length).toBe(1);
      expect(response.body.tools[0].name).toBe('Design Tool');
    });
  });
  
  describe('POST /api/tools', () => {
    it('should create a new tool when authenticated', async () => {
      const newTool = {
        name: 'New Test Tool',
        description: 'A brand new tool for testing',
        category: 'testing',
      };
      
      const response = await request(app)
        .post('/api/tools')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newTool)
        .expect(201);
        
      expect(response.body).toHaveProperty('tool');
      expect(response.body.tool.name).toBe(newTool.name);
      expect(response.body.tool.description).toBe(newTool.description);
      expect(response.body.tool.createdBy.toString()).toBe(testUser._id.toString());
      
      // Verify tool was saved to database
      const savedTool = await Tool.findById(response.body.tool._id);
      expect(savedTool).toBeTruthy();
      expect(savedTool!.name).toBe(newTool.name);
    });
    
    it('should return 401 when not authenticated', async () => {
      const newTool = {
        name: 'Unauthorized Tool',
        description: 'This tool should not be created',
        category: 'testing',
      };
      
      await request(app)
        .post('/api/tools')
        .send(newTool)
        .expect(401);
        
      // Verify tool was not saved to database
      const toolCount = await Tool.countDocuments();
      expect(toolCount).toBe(0);
    });
    
    it('should return 400 when required fields are missing', async () => {
      const incompleteTool = {
        description: 'Missing name field'
      };
      
      await request(app)
        .post('/api/tools')
        .set('Authorization', `Bearer ${authToken}`)
        .send(incompleteTool)
        .expect(400);
    });
  });
  
  describe('GET /api/tools/:id', () => {
    it('should get a specific tool by ID', async () => {
      const tool = await createTestTool(testUser._id, { 
        name: 'Specific Tool',
        description: 'This is a specific tool to retrieve'
      });
      
      const response = await request(app)
        .get(`/api/tools/${tool._id}`)
        .expect(200);
        
      expect(response.body).toHaveProperty('tool');
      expect(response.body.tool.name).toBe('Specific Tool');
      expect(response.body.tool._id.toString()).toBe(tool._id.toString());
    });
    
    it('should return 404 for non-existent tool ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      await request(app)
        .get(`/api/tools/${nonExistentId}`)
        .expect(404);
    });
  });
  
  describe('PUT /api/tools/:id', () => {
    it('should update a tool when user is the creator', async () => {
      const tool = await createTestTool(testUser._id);
      const updates = { name: 'Updated Tool Name' };
      
      const response = await request(app)
        .put(`/api/tools/${tool._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);
        
      expect(response.body.tool.name).toBe('Updated Tool Name');
      
      // Verify update in database
      const updatedTool = await Tool.findById(tool._id);
      expect(updatedTool!.name).toBe('Updated Tool Name');
    });
    
    it('should return 403 when user is not the creator', async () => {
      // Create a different user
      const anotherUser = await createTestUser({ email: 'another@example.com' });
      
      // Create a tool owned by the other user
      const tool = await createTestTool(anotherUser._id);
      
      // Try to update with original user's auth token
      await request(app)
        .put(`/api/tools/${tool._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Should Not Update' })
        .expect(403);
        
      // Verify the tool was not updated
      const unchangedTool = await Tool.findById(tool._id);
      expect(unchangedTool!.name).toBe('Test Tool');
    });
  });
});