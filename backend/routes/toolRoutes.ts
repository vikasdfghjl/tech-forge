import express from "express";
import toolController from '../controllers/toolController';
import { protect, optionalAuth } from '../middleware/auth';
import { toggleWant, getInteractionStatus } from '../controllers/interactionController';

const router = express.Router();

// Apply optional auth to all routes by default
router.use(optionalAuth);

// Public routes
router.get('/', toolController.getTools);
router.get('/:id', toolController.getToolById);

// Protected routes
router.post('/', protect, toolController.createTool);
router.put('/:id', protect, toolController.updateTool);
router.delete('/:id', protect, toolController.deleteTool);
router.put('/:id/upvote', protect, toolController.upvoteTool);
router.put('/:id/want', protect, toolController.wantTool);

// Define interaction routes
router.get('/interactions/status', protect, getInteractionStatus);
router.put('/:id/upvote', protect, toolController.upvoteTool);
router.put('/:id/want', protect, toolController.wantTool);

// Get interaction status for a specific tool
router.get('/:id/interaction-status', protect, (req, res) => {
  req.query.itemType = 'tool';
  req.query.itemId = req.params.id;
  return getInteractionStatus(req, res);
});

// Add a route for adding comments
router.post('/:id/comments', protect, toolController.addComment);

// Add routes for editing and deleting comments
router.put('/:id/comments/:commentId', protect, toolController.editComment);
router.delete('/:id/comments/:commentId', protect, toolController.deleteComment);

// Get tools created by the current user
router.get('/user/me', protect, toolController.getUserTools);

export default router;

