import { Request, Response } from 'express';
import Interaction from '../models/Interaction';

interface AuthRequest extends Request {
  user?: any;
  isAuthenticated?: boolean;
}

// Toggle upvote status
export const toggleUpvote = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.isAuthenticated || !req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Please login first'
      });
    }

    // Get itemId and itemType from body or route params
    const { itemId = req.body.itemId, itemType = req.body.itemType } = req.body;
    
    if (!itemId || !itemType) {
      return res.status(400).json({
        success: false,
        message: 'Item ID and type are required'
      });
    }

    // Find existing interaction
    let interaction = await Interaction.findOne({
      user: req.user._id,
      itemId,
      itemType,
      interactionType: 'upvote'
    });

    if (interaction) {
      // Toggle the active state if interaction exists
      interaction.active = !interaction.active;
      await interaction.save();
      
      return res.status(200).json({
        success: true,
        active: interaction.active,
        message: interaction.active ? 'Upvoted successfully' : 'Upvote removed'
      });
    } else {
      // Create new interaction
      interaction = await Interaction.create({
        user: req.user._id,
        itemId,
        itemType,
        interactionType: 'upvote',
        active: true
      });
      
      return res.status(201).json({
        success: true,
        active: true,
        message: 'Upvoted successfully'
      });
    }
  } catch (error) {
    console.error('Error in toggleUpvote:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Toggle want status
export const toggleWant = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.isAuthenticated || !req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Please login first'
      });
    }

    // Get itemId and itemType from body or route params
    const { itemId = req.body.itemId, itemType = req.body.itemType } = req.body;
    
    if (!itemId || !itemType) {
      return res.status(400).json({
        success: false,
        message: 'Item ID and type are required'
      });
    }

    // Find existing interaction
    let interaction = await Interaction.findOne({
      user: req.user._id,
      itemId,
      itemType,
      interactionType: 'want'
    });

    if (interaction) {
      // Toggle the active state if interaction exists
      interaction.active = !interaction.active;
      await interaction.save();
      
      return res.status(200).json({
        success: true,
        active: interaction.active,
        message: interaction.active ? 'Added to wants' : 'Removed from wants'
      });
    } else {
      // Create new interaction
      interaction = await Interaction.create({
        user: req.user._id,
        itemId,
        itemType,
        interactionType: 'want',
        active: true
      });
      
      return res.status(201).json({
        success: true,
        active: true,
        message: 'Added to wants successfully'
      });
    }
  } catch (error) {
    console.error('Error in toggleWant:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get interaction status for an item
export const getInteractionStatus = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { itemType, itemId } = req.query;
    
    if (!itemType || !itemId) {
      return res.status(400).json({ message: 'Item type and ID are required' });
    }

    const interaction = await Interaction.findOne({
      userId: req.user._id,
      itemType,
      itemId
    });

    if (!interaction) {
      return res.json({
        hasUpvoted: false,
        hasWanted: false
      });
    }

    // Return the interaction status with proper property names
    const upvoteInteraction = await Interaction.findOne({
      user: req.user._id,
      itemType,
      itemId,
      interactionType: 'upvote',
      active: true
    });
    
    const wantInteraction = await Interaction.findOne({
      user: req.user._id,
      itemType,
      itemId,
      interactionType: 'want',
      active: true
    });
    
    return res.json({
      hasUpvoted: !!upvoteInteraction,
      hasWanted: !!wantInteraction
    });
  } catch (error) {
    console.error('Error getting interaction status:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
