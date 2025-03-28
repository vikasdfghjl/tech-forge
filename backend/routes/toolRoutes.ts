import express from "express";
import { 
  getTools as getAllTools, 
  getToolById, 
  createTool, 
  updateTool, 
  deleteTool,
  toggleUpvote,
  upvoteTool,
  wantTool
} from '../controllers/toolController';
import { protect, optionalAuth } from '../middleware/auth';
import { toggleWant, getInteractionStatus } from '../controllers/interactionController';
import { Request, Response } from "express";
import mongoose from "mongoose";
import { IUser } from "../models/User";

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}

const router = express.Router();

// Apply optional auth to all routes by default
router.use(optionalAuth);

// Public routes
router.get('/', getAllTools);
router.get('/:id', getToolById);

// Protected routes - ensure protect middleware is applied
router.post('/', protect, createTool);
router.put('/:id', protect, updateTool);
router.delete('/:id', protect, deleteTool);
router.put('/:id/upvote', protect, upvoteTool);
router.put('/:id/want', protect, wantTool);  // Add this route

// Add a temporary public endpoint for testing upvotes
router.post('/:id/upvote-test', async (req: Request, res: Response) => {
  console.log('[DEBUG] Test upvote endpoint called');
  try {
    // For testing purposes only
    const testUserId = '65fd57e8f9131a75e05ebf7f'; // Replace with a valid test user ID
    const user = await import('../models/User').then(module => module.default.findById(testUserId));
    
    if (!user) {
      return res.status(404).json({ message: 'Test user not found' });
    }
    
    req.user = user;
    req.params.id = req.params.id;
    
    // Now call the regular upvote handler
    return toggleUpvote(req, res);
  } catch (error) {
    console.error('[ERROR] Test upvote error:', error);
    return res.status(500).json({ message: 'Error in test upvote' });
  }
});

// Use optionalAuth for upvotes to allow more flexibility during testing
router.put('/:id/upvote', protect, upvoteTool);

// Define routes
router.get('/interactions/status', protect, getInteractionStatus);
router.post('/interactions/upvote', protect, toggleUpvote);
router.post('/interactions/want', protect, toggleWant);

// Add routes for upvote/want with the pattern the frontend is expecting
router.put('/:id/upvote', protect, (req: Request, res: Response) => {
  // Set itemType and itemId from the route params
  req.body.itemType = 'tool'; // Changed from 'product' to 'tool' for consistency
  req.body.itemId = req.params.id;
  return toggleUpvote(req, res);
});

router.put('/:id/want', protect, (req, res) => {
  // Set itemType and itemId from the route params
  req.body.itemType = 'tool';
  req.body.itemId = req.params.id;
  return toggleWant(req, res);
});

// Add a route to get status for a specific tool
router.get('/:id/interaction-status', protect, (req, res) => {
  req.query.itemType = 'tool';
  req.query.itemId = req.params.id;
  // Forward to the getInteractionStatus handler
  return getInteractionStatus(req, res);
});

export default router;

