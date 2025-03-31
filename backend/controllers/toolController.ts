import { Request, Response } from "express";
import mongoose from 'mongoose';
import Tool from "../models/Tool";
import Interaction from "../models/Interaction";
import { IUser } from '../models/User';
import { IComment } from '../models/Tool';

// Extended Request interface to include user property
interface AuthRequest extends Request {
  user?: IUser;
  isAuthenticated?: boolean;
}

// Consolidate all controller functions into a single object
const toolController = {
  // Fetch all tools
  getTools: async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("Fetching tools from database...");
      const tools = await Tool.find();
      console.log("Tools fetched:", tools);
      res.status(200).send(tools);
    } catch (error) {
      console.error("Error fetching tools:", error);
      res.status(500).send(error);
    }
  },

  // Create a new tool
  createTool: async (req: AuthRequest, res: Response): Promise<void | Response> => {
    try {
      console.log('[DEBUG CREATE TOOL] Checking user authentication...');
      if (!req.user || !req.user._id) {
        console.log('[DEBUG CREATE TOOL] User not authenticated');
        return res.status(401).json({ message: 'Authentication required to create a tool' });
      }
  
      console.log('[DEBUG CREATE TOOL] Authenticated user:', req.user._id);
  
      const { name, description, category, website, logo, tags } = req.body;
  
      if (!name || !description) {
        console.log('[DEBUG CREATE TOOL] Missing required fields: name or description');
        return res.status(400).json({ message: 'Name and description are required' });
      }
  
      console.log('[DEBUG CREATE TOOL] Creating tool with data:', { name, description, category, website, logo, tags });
  
      const newTool = new Tool({
        name,
        description,
        category: category || 'Other',
        website,
        logo,
        tags: tags || [],
        creator: req.user._id, // Change from 'user' to 'creator' to match the schema
      });
  
      await newTool.save();
      console.log('[DEBUG CREATE TOOL] Tool created successfully:', newTool._id);
      res.status(201).json(newTool);
    } catch (error) {
      console.error('[DEBUG CREATE TOOL] Error creating tool:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Update a tool
  updateTool: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updatedTool = await Tool.findByIdAndUpdate(id, req.body, { new: true });
      if (!updatedTool) {
        res.status(404).send({ message: "Tool not found" });
        return;
      }
      res.status(200).send(updatedTool);
    } catch (error) {
      console.error("Error updating tool:", error);
      res.status(500).send(error);
    }
  },

  // Delete a tool
  deleteTool: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deletedTool = await Tool.findByIdAndDelete(id);
      if (!deletedTool) {
        res.status(404).send({ message: "Tool not found" });
        return;
      }
      res.status(200).send({ message: "Tool deleted successfully" });
    } catch (error) {
      console.error("Error deleting tool:", error);
      res.status(500).send(error);
    }
  },

  // Get a tool by ID
  getToolById: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ message: "Tool ID is required" });
        return;
      }

      const tool = await Tool.findById(id);

      if (!tool) {
        res.status(404).json({ message: "Tool not found" });
        return;
      }

      res.status(200).json(tool);
    } catch (error) {
      console.error("Error in getToolById:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  // Toggle upvote for a tool
  toggleUpvote: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      console.log('[DEBUG UPVOTE] Starting upvote toggle for tool');
      console.log('[DEBUG UPVOTE] User:', req.user?._id);
      console.log('[DEBUG UPVOTE] Tool ID:', req.params.id);
      
      const toolId = req.params.id;
      
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }
      
      const userId = req.user._id;
      
      // Check if user has already upvoted
      const existingInteraction = await Interaction.findOne({
        user: userId,
        itemId: toolId,
        itemType: 'tool',
        interactionType: 'upvote'
      });
      
      console.log('[DEBUG UPVOTE] Existing interaction:', existingInteraction ? 'Found' : 'Not found');
  
      let response: { success: boolean; active: boolean; message: string; count?: number };
      
      if (existingInteraction) {
        // Toggle the active state
        existingInteraction.active = !existingInteraction.active;
        await existingInteraction.save();
        
        console.log('[DEBUG UPVOTE] Toggled existing interaction to:', existingInteraction.active ? 'active' : 'inactive');
        
        response = {
          success: true,
          active: existingInteraction.active,
          message: existingInteraction.active ? 'Upvote added' : 'Upvote removed'
        };
      } else {
        // Create new upvote interaction
        const newInteraction = await Interaction.create({
          user: userId,
          itemId: toolId,
          itemType: 'tool',
          interactionType: 'upvote',
          active: true
        });
        
        console.log('[DEBUG UPVOTE] Created new interaction:', newInteraction._id);
        
        response = {
          success: true,
          active: true,
          message: 'Upvote added'
        };
      }
      
      // Update the tool upvote count
      const upvoteCount = await Interaction.countDocuments({
        itemId: toolId,
        itemType: 'tool',
        interactionType: 'upvote',
        active: true
      });
      
      console.log('[DEBUG UPVOTE] New upvote count:', upvoteCount);
      
      response.count = upvoteCount;
      
      res.status(200).json(response);
    } catch (error: any) {
      console.error('[ERROR UPVOTE] Error in toggleUpvote:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while processing upvote',
        error: error.message
      });
    }
  },

  // Upvote a tool
  upvoteTool: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const toolId = req.params.id;
      console.log(`[UPVOTE DEBUG] Processing upvote request for tool: ${toolId}`);
      console.log(`[UPVOTE DEBUG] User authentication:`, {
        isAuthenticated: !!req.user,
        userId: req.user?._id,
        cookies: req.cookies
      });

      // Validate MongoDB ID
      if (!mongoose.Types.ObjectId.isValid(toolId)) {
        console.log('[UPVOTE DEBUG] Invalid tool ID');
        res.status(400).json({ message: 'Invalid tool ID' });
        return;
      }

      // Check if user is authenticated
      if (!req.user || !req.user._id) {
        console.log('[UPVOTE DEBUG] User not authenticated');
        res.status(401).json({ message: 'You must be logged in to upvote tools' });
        return;
      }

      console.log(`[UPVOTE DEBUG] Finding tool with ID: ${toolId}`);
      const tool = await Tool.findById(toolId);

      if (!tool) {
        console.log('[UPVOTE DEBUG] Tool not found');
        res.status(404).json({ message: 'Tool not found' });
        return;
      }

      // Check if user has already upvoted
      console.log(`[UPVOTE DEBUG] Checking if user ${req.user._id} has already upvoted`);
      const existingInteraction = await Interaction.findOne({
        user: req.user._id,
        itemId: toolId,
        itemType: 'tool',
        interactionType: 'upvote'
      });

      console.log(`[UPVOTE DEBUG] Existing interaction:`, existingInteraction ? 'Found' : 'Not found');
      
      let userUpvoted = false;

      if (existingInteraction) {
        // Toggle the active state
        existingInteraction.active = !existingInteraction.active;
        await existingInteraction.save();
        userUpvoted = existingInteraction.active;
        console.log(`[UPVOTE DEBUG] Toggled upvote to: ${userUpvoted ? 'active' : 'inactive'}`);
      } else {
        // Create new upvote interaction
        await Interaction.create({
          user: req.user._id,
          itemId: toolId,
          itemType: 'tool',
          interactionType: 'upvote',
          active: true
        });
        userUpvoted = true;
        console.log(`[UPVOTE DEBUG] Created new upvote (active)`);
      }

      // Count active upvotes
      const upvoteCount = await Interaction.countDocuments({
        itemId: toolId,
        itemType: 'tool',
        interactionType: 'upvote',
        active: true
      });
      console.log(`[UPVOTE DEBUG] New upvote count: ${upvoteCount}`);

      // Update the actual tool document with the new upvote count
      await Tool.findByIdAndUpdate(toolId, { upvotes: upvoteCount });

      console.log(`[UPVOTE DEBUG] Sending response: upvotes=${upvoteCount}, userUpvoted=${userUpvoted}`);
      res.status(200).json({ 
        success: true, 
        upvotes: upvoteCount,
        userUpvoted 
      });
    } catch (error) {
      console.error('[UPVOTE ERROR]', error);
      res.status(500).json({ message: 'Server error while processing upvote' });
    }
  },

  // Want a tool (mark as wanted)
  wantTool: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const toolId = req.params.id;

      // Validate MongoDB ID
      if (!mongoose.Types.ObjectId.isValid(toolId)) {
        res.status(400).json({ message: 'Invalid tool ID' });
        return;
      }

      // Check if user is authenticated
      if (!req.user || !req.user._id) {
        res.status(401).json({ message: 'You must be logged in to mark tools as wanted' });
        return;
      }

      const tool = await Tool.findById(toolId);

      if (!tool) {
        res.status(404).json({ message: 'Tool not found' });
        return;
      }

      // Check if user has already wanted this tool
      const existingInteraction = await Interaction.findOne({
        user: req.user._id,
        itemId: toolId,
        itemType: 'tool',
        interactionType: 'want'
      });

      let userWanted = false;

      if (existingInteraction) {
        // Toggle the active state
        existingInteraction.active = !existingInteraction.active;
        await existingInteraction.save();
        userWanted = existingInteraction.active;
      } else {
        // Create new want interaction
        await Interaction.create({
          user: req.user._id,
          itemId: toolId,
          itemType: 'tool',
          interactionType: 'want',
          active: true
        });
        userWanted = true;
      }

      // Count active wants
      const wantCount = await Interaction.countDocuments({
        itemId: toolId,
        itemType: 'tool',
        interactionType: 'want',
        active: true
      });

      // Update the actual tool document with the new want count
      await Tool.findByIdAndUpdate(toolId, { wants: wantCount });

      res.status(200).json({ 
        success: true, 
        wants: wantCount,
        userWanted 
      });
    } catch (error) {
      console.error('Want error:', error);
      res.status(500).json({ message: 'Server error while processing want request' });
    }
  },

  // Add a new comment to a tool
  addComment: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const toolId = req.params.id;
      const { text } = req.body;
  
      // Validate MongoDB ID
      if (!mongoose.Types.ObjectId.isValid(toolId)) {
        res.status(400).json({ message: 'Invalid tool ID' });
        return;
      }
  
      // Check if user is authenticated
      if (!req.user || !req.user._id) {
        res.status(401).json({ message: 'You must be logged in to comment' });
        return;
      }
  
      // Validate comment text
      if (!text || typeof text !== 'string' || text.trim() === '') {
        res.status(400).json({ message: 'Comment text is required' });
        return;
      }
  
      // Find the tool by ID
      const tool = await Tool.findById(toolId);
      if (!tool) {
        res.status(404).json({ message: 'Tool not found' });
        return;
      }
  
      // Create a new comment
      const newComment = {
        text: text.trim(),
        author: req.user._id,
        createdAt: new Date()
      };
  
      // Add the comment to the tool
      tool.comments.push(newComment as any);
      await tool.save();
  
      // Populate author information
      const populatedTool = await Tool.findById(toolId)
        .populate({
          path: 'comments.author',
          select: 'username name email'
        });
  
      if (!populatedTool) {
        res.status(404).json({ message: 'Tool not found after saving comment' });
        return;
      }
  
      // Get the newly added comment
      const addedComment = populatedTool.comments[populatedTool.comments.length - 1];
      const authorObj = addedComment.author as any;
  
      // Return the added comment
      res.status(201).json({
        _id: addedComment._id,
        id: addedComment._id, // For frontend compatibility
        text: addedComment.text,
        author: authorObj.username || authorObj.name || authorObj.email || 'Anonymous',
        createdAt: addedComment.createdAt,
        timestamp: addedComment.createdAt.getTime()
      });
    } catch (error) {
      console.error('Error in addComment:', error);
      res.status(500).json({ message: 'Server error while adding comment' });
    }
  },

  // Get all tools created by the currently logged in user
  getUserTools: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Ensure the user is authenticated
      if (!req.user || !req.user._id) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
  
      // Find all tools created by this user
      const tools = await Tool.find({ creator: req.user._id })
        .sort({ createdAt: -1 })
        .populate('creator', 'name username email');
  
      res.status(200).json({ 
        success: true,
        count: tools.length,
        tools 
      });
    } catch (error) {
      console.error('Error fetching user tools:', error);
      res.status(500).json({ message: 'Server error while fetching user tools' });
    }
  }
};

export = toolController;
