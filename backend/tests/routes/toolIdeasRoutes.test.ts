import request from 'supertest';
import express from 'express';
import toolIdeasRouter from '../../routes/toolIdeas';

describe('Tool Ideas Routes', () => {
  const app = express();
  app.use('/api/tool-ideas', toolIdeasRouter);

  describe('GET /api/tool-ideas', () => {
    it('should return a response for the tool ideas root endpoint', async () => {
      const response = await request(app)
        .get('/api/tool-ideas')
        .expect(200);

      expect(response.text).toBe('Tool Ideas Routes');
    });
  });
});