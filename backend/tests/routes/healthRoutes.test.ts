import request from 'supertest';
import express from 'express';
import healthRoutes from '../../routes/healthRoutes';

describe('Health Routes', () => {
  const app = express();
  app.use('/api/health', healthRoutes);

  describe('GET /api/health', () => {
    it('should return a successful health check response', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('message', 'API is running');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('version');
      
      // Verify timestamp is in the correct format
      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.toString()).not.toBe('Invalid Date');
    });
  });
});