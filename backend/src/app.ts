import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { setRoutes } from './routes/index';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import debug from 'debug';

const logger = debug('tech-forge:app');

const app = express();
const PORT = process.env.NODE_PORT || 5000;

mongoose.connect('mongodb://localhost:27017/techforge')
    .then(() => logger('Connected to MongoDB'))
    .catch((err) => logger('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add request logging
app.use(requestLogger);

setRoutes(app);

// Add error handling
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});