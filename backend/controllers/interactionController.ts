import { Request, Response } from 'express';
import Interaction from '../models/Interaction';

// Debug log for module loading
console.log('Loading interactionController.ts');

interface AuthRequest extends Request {
  user?: any;
  isAuthenticated?: boolean;
}

// Toggle upvote status
export const toggleUpvote = async (req: AuthRequest, res: Response) => {
  console.log('toggleUpvote called with params:', { 
    body: req.body,
    user: req.user ? 'authenticated' : 'unauthenticated'
  });
  
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
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Toggle want status
export const toggleWant = async (req: AuthRequest, res: Response) => {
  console.log('toggleWant called with params:', { 
    body: req.body,
    user: req.user ? 'authenticated' : 'unauthenticated'
  });
  
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
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get interaction status for an item
export const getInteractionStatus = async (req: AuthRequest, res: Response) => {
  console.log('getInteractionStatus called with params:', { 
    query: req.query,
    user: req.user ? 'authenticated' : 'unauthenticated'
  });
  
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { itemType, itemId } = req.query;
    
    if (!itemType || !itemId) {
      return res.status(400).json({ message: 'Item type and ID are required' });
    }

    // Perform separate queries for upvote and want interactions
    const upvoteInteraction = await Interaction.findOne({
      user: req.user._id, // Fixed: changed from userId to user
      itemType,
      itemId,
      interactionType: 'upvote',
      active: true
    });
    
    const wantInteraction = await Interaction.findOne({
      user: req.user._id, // Fixed: changed from userId to user
      itemType,
      itemId,
      interactionType: 'want',
      active: true
    });
    
    console.log(`Interaction status for ${itemId}: upvoted=${!!upvoteInteraction}, wanted=${!!wantInteraction}`);
    
    return res.json({
      hasUpvoted: !!upvoteInteraction,
      hasWanted: !!wantInteraction
    });
  } catch (error) {
    console.error('Error getting interaction status:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Debug log for module exports
console.log('interactionController exports:', {
  toggleUpvote: typeof toggleUpvote,
  toggleWant: typeof toggleWant,
  getInteractionStatus: typeof getInteractionStatus
});
