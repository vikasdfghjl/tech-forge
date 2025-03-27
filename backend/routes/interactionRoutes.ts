import express from 'express';
import { toggleUpvote, toggleWant, getInteractionStatus } from '../controllers/interactionController';
import { checkAuth } from '../middleware/authMiddleware';

const router = express.Router();

// Apply checkAuth to each route individually instead of using router.use
router.post('/upvote', checkAuth, toggleUpvote);
router.post('/want', checkAuth, toggleWant);
router.get('/status', checkAuth, getInteractionStatus);

export default router;
