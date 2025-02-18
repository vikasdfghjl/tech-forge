import { Express } from 'express';
import toolRoutes from './toolRoutes';

export const setRoutes = (app: Express) => {
    app.use('/api', toolRoutes);  // Mount routes under /api prefix
};