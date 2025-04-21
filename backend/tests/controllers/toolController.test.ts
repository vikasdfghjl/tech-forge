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

  describe('DELETE /api/tools/:id', () => {
    it('should delete a tool successfully', async () => {
      const tool = await createTestTool(testUser._id);
      
      // Verify tool exists before deletion
      const toolBeforeDeletion = await Tool.findById(tool._id);
      expect(toolBeforeDeletion).toBeTruthy();
      
      await request(app)
        .delete(`/api/tools/${tool._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      // Verify tool no longer exists in database
      const toolAfterDeletion = await Tool.findById(tool._id);
      expect(toolAfterDeletion).toBeNull();
    });
    
    it('should return 404 when trying to delete non-existent tool', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      await request(app)
        .delete(`/api/tools/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
  
  describe('POST /api/tools/:id/upvote', () => {
    it('should upvote a tool when user is authenticated', async () => {
      const tool = await createTestTool(testUser._id);
      
      const response = await request(app)
        .post(`/api/tools/${tool._id}/upvote`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('upvotes', 1);
      expect(response.body).toHaveProperty('userUpvoted', true);
    });
    
    it('should remove upvote when user upvotes the same tool twice', async () => {
      const tool = await createTestTool(testUser._id);
      
      // First upvote
      await request(app)
        .post(`/api/tools/${tool._id}/upvote`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      // Second upvote (should toggle off)
      const response = await request(app)
        .post(`/api/tools/${tool._id}/upvote`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('upvotes', 0);
      expect(response.body).toHaveProperty('userUpvoted', false);
    });
    
    it('should return 401 when trying to upvote without authentication', async () => {
      const tool = await createTestTool(testUser._id);
      
      await request(app)
        .post(`/api/tools/${tool._id}/upvote`)
        .expect(401);
    });
    
    it('should return 404 when trying to upvote a non-existent tool', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      await request(app)
        .post(`/api/tools/${nonExistentId}/upvote`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
    
    it('should return 400 when using an invalid tool ID format', async () => {
      await request(app)
        .post('/api/tools/invalid-id-format/upvote')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });
  
  describe('POST /api/tools/:id/want', () => {
    it('should mark a tool as wanted when user is authenticated', async () => {
      const tool = await createTestTool(testUser._id);
      
      const response = await request(app)
        .post(`/api/tools/${tool._id}/want`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('wants', 1);
      expect(response.body).toHaveProperty('userWanted', true);
    });
    
    it('should remove want when user marks the same tool as wanted twice', async () => {
      const tool = await createTestTool(testUser._id);
      
      // First want
      await request(app)
        .post(`/api/tools/${tool._id}/want`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      // Second want (should toggle off)
      const response = await request(app)
        .post(`/api/tools/${tool._id}/want`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('wants', 0);
      expect(response.body).toHaveProperty('userWanted', false);
    });
    
    it('should return 401 when trying to want a tool without authentication', async () => {
      const tool = await createTestTool(testUser._id);
      
      await request(app)
        .post(`/api/tools/${tool._id}/want`)
        .expect(401);
    });
    
    it('should return 404 when trying to want a non-existent tool', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      await request(app)
        .post(`/api/tools/${nonExistentId}/want`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
    
    it('should return 400 when using an invalid tool ID format', async () => {
      await request(app)
        .post('/api/tools/invalid-id-format/want')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('POST /api/tools/:id/comments', () => {
    it('should add a comment to a tool when authenticated', async () => {
      const tool = await createTestTool(testUser._id);
      const commentText = 'This is a test comment';
      
      const response = await request(app)
        .post(`/api/tools/${tool._id}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ text: commentText })
        .expect(201);
      
      expect(response.body).toHaveProperty('text', commentText);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('createdAt');
      
      // Verify comment was added to the tool in the database
      const updatedTool = await Tool.findById(tool._id);
      expect(updatedTool!.comments.length).toBe(1);
      expect(updatedTool!.comments[0].text).toBe(commentText);
    });
    
    it('should return 401 when adding a comment without authentication', async () => {
      const tool = await createTestTool(testUser._id);
      
      await request(app)
        .post(`/api/tools/${tool._id}/comments`)
        .send({ text: 'Unauthorized comment' })
        .expect(401);
      
      // Verify no comment was added
      const updatedTool = await Tool.findById(tool._id);
      expect(updatedTool!.comments.length).toBe(0);
    });
    
    it('should return 400 when comment text is empty', async () => {
      const tool = await createTestTool(testUser._id);
      
      await request(app)
        .post(`/api/tools/${tool._id}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ text: '' })
        .expect(400);
      
      // Verify no comment was added
      const updatedTool = await Tool.findById(tool._id);
      expect(updatedTool!.comments.length).toBe(0);
    });
    
    it('should return 404 when tool does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      await request(app)
        .post(`/api/tools/${nonExistentId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ text: 'Comment on non-existent tool' })
        .expect(404);
    });
  });
  
  describe('PUT /api/tools/:id/comments/:commentId', () => {
    it('should edit a comment when user is the author', async () => {
      // Create a tool with a comment
      const tool = await createTestTool(testUser._id);
      
      const commentResponse = await request(app)
        .post(`/api/tools/${tool._id}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ text: 'Original comment' });
      
      const commentId = commentResponse.body._id;
      const updatedText = 'Updated comment text';
      
      // Edit the comment
      const editResponse = await request(app)
        .put(`/api/tools/${tool._id}/comments/${commentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ text: updatedText })
        .expect(200);
      
      expect(editResponse.body).toHaveProperty('text', updatedText);
      
      // Verify comment was updated in database
      const updatedTool = await Tool.findById(tool._id);
      const updatedComment = updatedTool!.comments.id(commentId);
      expect(updatedComment!.text).toBe(updatedText);
    });
    
    it('should return 403 when user is not the author of the comment', async () => {
      // Create another user
      const anotherUser = await createTestUser({ email: 'another@example.com', username: 'anotheruser' });
      const anotherUserToken = jwt.sign({ id: anotherUser._id }, process.env.JWT_SECRET || 'default_secret', {
        expiresIn: '1h'
      });
      
      // Create a tool with a comment from the original user
      const tool = await createTestTool(testUser._id);
      
      const commentResponse = await request(app)
        .post(`/api/tools/${tool._id}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ text: 'Original user comment' });
      
      const commentId = commentResponse.body._id;
      
      // Try to edit with another user
      await request(app)
        .put(`/api/tools/${tool._id}/comments/${commentId}`)
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .send({ text: 'Should not update' })
        .expect(403);
      
      // Verify comment was not changed
      const updatedTool = await Tool.findById(tool._id);
      const unchangedComment = updatedTool!.comments.id(commentId);
      expect(unchangedComment!.text).toBe('Original user comment');
    });
  });
  
  describe('DELETE /api/tools/:id/comments/:commentId', () => {
    it('should delete a comment when user is the author', async () => {
      // Create a tool with a comment
      const tool = await createTestTool(testUser._id);
      
      const commentResponse = await request(app)
        .post(`/api/tools/${tool._id}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ text: 'Comment to delete' });
      
      const commentId = commentResponse.body._id;
      
      // Delete the comment
      await request(app)
        .delete(`/api/tools/${tool._id}/comments/${commentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      // Verify comment was deleted
      const updatedTool = await Tool.findById(tool._id);
      expect(updatedTool!.comments.length).toBe(0);
    });
    
    it('should return 403 when user is not the author of the comment', async () => {
      // Create another user
      const anotherUser = await createTestUser({ email: 'delete@example.com', username: 'deleteuser' });
      const anotherUserToken = jwt.sign({ id: anotherUser._id }, process.env.JWT_SECRET || 'default_secret', {
        expiresIn: '1h'
      });
      
      // Create a tool with a comment from the original user
      const tool = await createTestTool(testUser._id);
      
      const commentResponse = await request(app)
        .post(`/api/tools/${tool._id}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ text: 'Comment that should not be deleted by another user' });
      
      const commentId = commentResponse.body._id;
      
      // Try to delete with another user
      await request(app)
        .delete(`/api/tools/${tool._id}/comments/${commentId}`)
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .expect(403);
      
      // Verify comment still exists
      const updatedTool = await Tool.findById(tool._id);
      expect(updatedTool!.comments.length).toBe(1);
    });
  });
  
  describe('GET /api/tools/user', () => {
    it('should get all tools created by the authenticated user', async () => {
      // Create tools for the test user
      await createTestTool(testUser._id, { name: 'User Tool 1' });
      await createTestTool(testUser._id, { name: 'User Tool 2' });
      
      // Create a different user and a tool for them
      const anotherUser = await createTestUser({ email: 'usertools@example.com' });
      await createTestTool(anotherUser._id, { name: 'Not User Tool' });
      
      const response = await request(app)
        .get('/api/tools/user')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('count', 2);
      expect(response.body.tools.length).toBe(2);
      
      // Verify correct tools were returned
      const toolNames = response.body.tools.map((tool: any) => tool.name);
      expect(toolNames).toContain('User Tool 1');
      expect(toolNames).toContain('User Tool 2');
      expect(toolNames).not.toContain('Not User Tool');
    });
    
    it('should return 401 when not authenticated', async () => {
      await request(app)
        .get('/api/tools/user')
        .expect(401);
    });
  });
});