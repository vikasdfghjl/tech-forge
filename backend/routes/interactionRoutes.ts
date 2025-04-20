import express from 'express';
import { toggleUpvote, toggleWant, getInteractionStatus } from '../controllers/interactionController';
import { protect, optionalAuth } from '../middleware/auth'; // Updated import to use auth.ts
import { Request, Response } from "express";
import User from '../models/User';
import Tool from '../models/Tool';
import mongoose from 'mongoose';
import { debugRouteImports } from '../utils/expressDebug';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Debug the imported controller functions
debugRouteImports('InteractionRoutes', {
  toggleUpvote,
  toggleWant,
  getInteractionStatus,
  protect,
  optionalAuth
});

const router = express.Router();

// Apply protect middleware to each route individually
try {
  console.log('Setting up /upvote route');
  router.post('/upvote', protect, toggleUpvote);
  
  console.log('Setting up /want route');
  router.post('/want', protect, toggleWant);
  
  console.log('Setting up /status route');
  router.get('/status', protect, getInteractionStatus);
} catch (error) {
  console.error('Error setting up routes:', error);
}

// Toggle bookmark for a tool
router.post('/bookmark/:id', protect, async (req: Request, res: Response) => {
  try {
    const toolId = req.params.id;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if tool exists
    const toolExists = await Tool.findById(toolId);
    if (!toolExists) {
      return res.status(404).json({ message: 'Tool not found' });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Convert to ObjectId for proper comparison
    const toolObjectId = new mongoose.Types.ObjectId(toolId);
    
    // Check if tool is already bookmarked
    const isBookmarked = user.bookmarkedTools?.some(id => 
      id.toString() === toolObjectId.toString()
    );

    if (isBookmarked) {
      // Remove the bookmark
      user.bookmarkedTools = user.bookmarkedTools.filter(id => 
        id.toString() !== toolObjectId.toString()
      );
      await user.save();
      return res.status(200).json({ 
        bookmarked: false,
        message: 'Tool removed from bookmarks' 
      });
    } else {
      // Add the bookmark
      if (!user.bookmarkedTools) {
        user.bookmarkedTools = [];
      }
      user.bookmarkedTools.push(toolObjectId);
      await user.save();
      return res.status(200).json({ 
        bookmarked: true,
        message: 'Tool added to bookmarks' 
      });
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get all bookmarked tools for the current user
router.get('/bookmarks', protect, async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Find user and populate bookmarkedTools with creator and comment author information
    const user = await User.findById(userId)
      .populate({
        path: 'bookmarkedTools',
        populate: [
          {
            // Populate the creator field with username and other info
            path: 'creator',
            model: 'User',
            select: 'username name _id email'
          },
          {
            // Populate comment authors (keeping this from previous change)
            path: 'comments.author',
            model: 'User',
            select: 'username name _id email'
          }
        ]
      });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      bookmarkedTools: user.bookmarkedTools || []
    });
  } catch (error) {
    console.error('Error fetching bookmarked tools:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
