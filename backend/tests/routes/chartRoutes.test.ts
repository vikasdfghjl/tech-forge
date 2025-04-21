import request from 'supertest';
import express from 'express';
import chartRoutes from '../../routes/ChartRoutes';

describe('Chart Routes', () => {
  const app = express();
  app.use('/api/charts', chartRoutes);

  describe('GET /api/charts', () => {
    it('should return a response for the chart root endpoint', async () => {
      const response = await request(app)
        .get('/api/charts')
        .expect(200);

      expect(response.text).toBe('Chart Routes');
    });
  });
});