import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { setupTestDB, setupTestApp, createTestUser, createTestTool } from '../utils/testUtils';
import Interaction from '../../models/Interaction';
import Tool from '../../models/Tool';

describe('Interaction Controller', () => {
  setupTestDB();
  const app = setupTestApp();
  
  let testUser: any;
  let authToken: string;
  let testTool: any;
  
  beforeEach(async () => {
    // Create a test user and generate auth token
    testUser = await createTestUser();
    authToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET || 'default_secret', {
      expiresIn: '1h'
    });
    
    // Create a test tool for interactions
    testTool = await createTestTool(testUser._id);
  });
  
  afterEach(async () => {
    // Clean up interactions after each test
    await Interaction.deleteMany({});
  });
  
  describe('POST /api/interactions/upvote', () => {
    it('should create a new upvote when authenticated', async () => {
      const payload = {
        itemId: testTool._id,
        itemType: 'tool'
      };
      
      const response = await request(app)
        .post('/api/interactions/upvote')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(201);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('active', true);
      expect(response.body).toHaveProperty('message', 'Upvoted successfully');
      
      // Verify interaction was created in the database
      const interaction = await Interaction.findOne({
        user: testUser._id,
        itemId: testTool._id,
        interactionType: 'upvote'
      });
      
      expect(interaction).toBeTruthy();
      expect(interaction!.active).toBe(true);
    });
    
    it('should toggle off an existing upvote', async () => {
      // Create an upvote first
      await Interaction.create({
        user: testUser._id,
        itemId: testTool._id,
        itemType: 'tool',
        interactionType: 'upvote',
        active: true
      });
      
      // Now toggle it off
      const response = await request(app)
        .post('/api/interactions/upvote')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemId: testTool._id,
          itemType: 'tool'
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('active', false);
      expect(response.body).toHaveProperty('message', 'Upvote removed');
      
      // Verify interaction was updated in the database
      const interaction = await Interaction.findOne({
        user: testUser._id,
        itemId: testTool._id,
        interactionType: 'upvote'
      });
      
      expect(interaction).toBeTruthy();
      expect(interaction!.active).toBe(false);
    });
    
    it('should return 401 when not authenticated', async () => {
      const payload = {
        itemId: testTool._id,
        itemType: 'tool'
      };
      
      await request(app)
        .post('/api/interactions/upvote')
        .send(payload)
        .expect(401);
      
      // Verify no interaction was created
      const interaction = await Interaction.findOne({
        itemId: testTool._id,
        interactionType: 'upvote'
      });
      
      expect(interaction).toBeNull();
    });
    
    it('should return 400 when required fields are missing', async () => {
      const incompletePayload = {
        // Missing itemId
        itemType: 'tool'
      };
      
      await request(app)
        .post('/api/interactions/upvote')
        .set('Authorization', `Bearer ${authToken}`)
        .send(incompletePayload)
        .expect(400);
    });
  });
  
  describe('POST /api/interactions/want', () => {
    it('should create a new want when authenticated', async () => {
      const payload = {
        itemId: testTool._id,
        itemType: 'tool'
      };
      
      const response = await request(app)
        .post('/api/interactions/want')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(201);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('active', true);
      expect(response.body).toHaveProperty('message', 'Added to wants successfully');
      
      // Verify interaction was created in the database
      const interaction = await Interaction.findOne({
        user: testUser._id,
        itemId: testTool._id,
        interactionType: 'want'
      });
      
      expect(interaction).toBeTruthy();
      expect(interaction!.active).toBe(true);
    });
    
    it('should toggle off an existing want', async () => {
      // Create a want first
      await Interaction.create({
        user: testUser._id,
        itemId: testTool._id,
        itemType: 'tool',
        interactionType: 'want',
        active: true
      });
      
      // Now toggle it off
      const response = await request(app)
        .post('/api/interactions/want')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemId: testTool._id,
          itemType: 'tool'
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('active', false);
      expect(response.body).toHaveProperty('message', 'Removed from wants');
      
      // Verify interaction was updated in the database
      const interaction = await Interaction.findOne({
        user: testUser._id,
        itemId: testTool._id,
        interactionType: 'want'
      });
      
      expect(interaction).toBeTruthy();
      expect(interaction!.active).toBe(false);
    });
    
    it('should return 401 when not authenticated', async () => {
      const payload = {
        itemId: testTool._id,
        itemType: 'tool'
      };
      
      await request(app)
        .post('/api/interactions/want')
        .send(payload)
        .expect(401);
      
      // Verify no interaction was created
      const interaction = await Interaction.findOne({
        itemId: testTool._id,
        interactionType: 'want'
      });
      
      expect(interaction).toBeNull();
    });
    
    it('should return 400 when required fields are missing', async () => {
      const incompletePayload = {
        // Missing itemType
        itemId: testTool._id
      };
      
      await request(app)
        .post('/api/interactions/want')
        .set('Authorization', `Bearer ${authToken}`)
        .send(incompletePayload)
        .expect(400);
    });
  });
  
  describe('GET /api/interactions/status', () => {
    it('should return interaction status for an authenticated user', async () => {
      // Create upvote interaction
      await Interaction.create({
        user: testUser._id,
        itemId: testTool._id,
        itemType: 'tool',
        interactionType: 'upvote',
        active: true
      });
      
      const response = await request(app)
        .get('/api/interactions/status')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          itemId: testTool._id.toString(),
          itemType: 'tool'
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('hasUpvoted', true);
      expect(response.body).toHaveProperty('hasWanted', false);
    });
    
    it('should return false for both interactions when none exist', async () => {
      const response = await request(app)
        .get('/api/interactions/status')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          itemId: testTool._id.toString(),
          itemType: 'tool'
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('hasUpvoted', false);
      expect(response.body).toHaveProperty('hasWanted', false);
    });
    
    it('should return correct status for inactive interactions', async () => {
      // Create inactive upvote interaction
      await Interaction.create({
        user: testUser._id,
        itemId: testTool._id,
        itemType: 'tool',
        interactionType: 'upvote',
        active: false
      });
      
      // Create active want interaction
      await Interaction.create({
        user: testUser._id,
        itemId: testTool._id,
        itemType: 'tool',
        interactionType: 'want',
        active: true
      });
      
      const response = await request(app)
        .get('/api/interactions/status')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          itemId: testTool._id.toString(),
          itemType: 'tool'
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('hasUpvoted', false);
      expect(response.body).toHaveProperty('hasWanted', true);
    });
    
    it('should return 401 when not authenticated', async () => {
      await request(app)
        .get('/api/interactions/status')
        .query({
          itemId: testTool._id.toString(),
          itemType: 'tool'
        })
        .expect(401);
    });
    
    it('should return 400 when required parameters are missing', async () => {
      await request(app)
        .get('/api/interactions/status')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          // Missing itemType
          itemId: testTool._id.toString()
        })
        .expect(400);
    });
  });
});