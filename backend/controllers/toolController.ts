import { Request, Response } from "express";
import mongoose from 'mongoose';
import Tool from "../models/Tool";
import Interaction from "../models/Interaction";
import { IUser } from '../models/User';

// Extended Request interface to include user property
interface AuthRequest extends Request {
  user?: IUser;
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
        user: req.user._id,
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
  toggleUpvote: async (req: Request, res: Response): Promise<void> => {
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

      // Validate MongoDB ID
      if (!mongoose.Types.ObjectId.isValid(toolId)) {
        res.status(400).json({ message: 'Invalid tool ID' });
        return;
      }

      // Check if user is authenticated
      if (!req.user || !req.user._id) {
        res.status(401).json({ message: 'You must be logged in to upvote tools' });
        return;
      }

      const tool = await Tool.findById(toolId);

      if (!tool) {
        res.status(404).json({ message: 'Tool not found' });
        return;
      }

      // Check if user has already upvoted
      const existingInteraction = await Interaction.findOne({
        user: req.user._id,
        itemId: toolId,
        itemType: 'tool',
        interactionType: 'upvote'
      });

      let userUpvoted = false;

      if (existingInteraction) {
        // Toggle the active state
        existingInteraction.active = !existingInteraction.active;
        await existingInteraction.save();
        userUpvoted = existingInteraction.active;
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
      }

      // Count active upvotes
      const upvoteCount = await Interaction.countDocuments({
        itemId: toolId,
        itemType: 'tool',
        interactionType: 'upvote',
        active: true
      });

      res.status(200).json({ 
        success: true, 
        upvotes: upvoteCount,
        userUpvoted 
      });
    } catch (error) {
      console.error('Upvote error:', error);
      res.status(500).json({ message: 'Server error while processing upvote' });
    }
  }
};

export = toolController;
