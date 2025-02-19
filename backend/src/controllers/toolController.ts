import { Request, Response } from 'express';
import Tool from '../models/Tool';
import Project from '../models/Project';
import debug from 'debug';
import Comment from '../models/Comment'; // Add this import

const logger = debug('tech-forge:controller:tool');

export const toolController = {
    create: async (req: Request, res: Response) => {
        try {
            logger('Creating new tool with data: %O', req.body);
            const tool = new Tool({ name: req.body.name });
            const savedTool = await tool.save();
            logger('Tool created successfully: %O', savedTool);
            res.status(201).json(savedTool);
        } catch (error) {
            logger('Error creating tool: %O', error);
            res.status(400).json({ 
                error: 'Failed to create tool',
                details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
            });
        }
    },

    getAll: async (_req: Request, res: Response) => {
        try {
            logger('Fetching all tools');
            const tools = await Tool.find();
            logger('Found %d tools', tools.length);
            res.status(200).json(tools);
        } catch (error) {
            logger('Error fetching tools: %O', error);
            res.status(400).json({ 
                error: 'Failed to fetch tools',
                details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
            });
        }
    },

    update: async (req: Request, res: Response) => {
        try {
            logger('Updating tool %s with data: %O', req.params.id, req.body);
            const updatedTool = await Tool.findByIdAndUpdate(
                req.params.id,
                { name: req.body.name },
                { new: true }
            );
            logger('Tool updated successfully: %O', updatedTool);
            res.status(200).json(updatedTool);
        } catch (error) {
            logger('Error updating tool: %O', error);
            res.status(400).json({ 
                error: 'Failed to update tool',
                details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
            });
        }
    },

    delete: async (req: Request, res: Response) => {
        try {
            logger('Deleting tool %s', req.params.id);
            await Tool.findByIdAndDelete(req.params.id);
            logger('Tool deleted successfully');
            res.status(200).json({ message: 'Tool deleted successfully' });
        } catch (error) {
            logger('Error deleting tool: %O', error);
            res.status(400).json({ 
                error: 'Failed to delete tool',
                details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
            });
        }
    },

    addToolToProject: async (req: Request, res: Response) => {
        try {
            const { projectId } = req.params;
            const { toolName, type } = req.body;

            if (!['want', 'fund'].includes(type)) {
                return res.status(400).json({ error: 'Invalid tool type. Must be "want" or "fund"' });
            }

            logger('Adding tool %s to project %s as %s', toolName, projectId, type);
            const project = await Project.findById(projectId);
            
            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            await project.addTool(toolName, type);
            logger('Tool added successfully to project');
            
            res.status(200).json(project);
        } catch (error) {
            logger('Error adding tool to project: %O', error);
            res.status(400).json({ 
                error: 'Failed to add tool to project',
                details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
            });
        }
    },

    getProjectTools: async (req: Request, res: Response) => {
        try {
            const { projectId } = req.params;
            const { type } = req.query;

            logger('Fetching tools for project %s', projectId);
            const project = await Project.findById(projectId);
            
            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            let tools = project.tools;
            if (type === 'want' || type === 'fund') {
                tools = tools.filter(tool => tool.type === type);
            }

            logger('Found %d tools', tools.length);
            res.status(200).json(tools);
        } catch (error) {
            logger('Error fetching project tools: %O', error);
            res.status(400).json({ 
                error: 'Failed to fetch project tools',
                details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
            });
        }
    },

    removeToolFromProject: async (req: Request, res: Response) => {
        try {
            const { projectId, toolName } = req.params;
            logger('Removing tool %s from project %s', toolName, projectId);
            
            const project = await Project.findOneAndUpdate(
                { _id: projectId },
                { 
                    $pull: { tools: { name: toolName } },
                    $inc: { 
                        wantCount: -1,
                        fundCount: -1
                    }
                },
                { new: true }
            );

            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            logger('Tool removed successfully from project');
            res.status(200).json(project);
        } catch (error) {
            logger('Error removing tool from project: %O', error);
            res.status(400).json({ 
                error: 'Failed to remove tool from project',
                details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
            });
        }
    },

    incrementWant: async (req: Request, res: Response) => {
        try {
            const { toolId } = req.params;
            const tool = await Tool.findById(toolId);
            if (!tool) {
                return res.status(404).json({ error: 'Tool not found' });
            }
            tool.wantCount += 1;
            await tool.save();
            res.status(200).json(tool);
        } catch (error) {
            logger('Error incrementing want count: %O', error);
            res.status(400).json({ error: 'Failed to increment want count' });
        }
    },

    incrementFund: async (req: Request, res: Response) => {
        try {
            const { toolId } = req.params;
            const tool = await Tool.findById(toolId);
            if (!tool) {
                return res.status(404).json({ error: 'Tool not found' });
            }
            tool.fundCount += 1;
            await tool.save();
            res.status(200).json(tool);
        } catch (error) {
            logger('Error incrementing fund count: %O', error);
            res.status(400).json({ error: 'Failed to increment fund count' });
        }
    },

    addComment: async (req: Request, res: Response) => {
        try {
            const { toolId } = req.params;
            const { text } = req.body;
            const tool = await Tool.findById(toolId);
            if (!tool) {
                return res.status(404).json({ error: 'Tool not found' });
            }
            const comment = new Comment({ text }); // Create a new instance of Comment
            tool.comments.push(comment);
            await tool.save();
            res.status(200).json(tool);
        } catch (error) {
            logger('Error adding comment: %O', error);
            res.status(400).json({ error: 'Failed to add comment' });
        }
    },

    likeComment: async (req: Request, res: Response) => {
        try {
            const { toolId, commentId } = req.params;
            const tool = await Tool.findById(toolId);
            if (!tool) {
                return res.status(404).json({ error: 'Tool not found' });
            }
            const comment = tool.comments.find((comment: { _id: any }) => comment._id.toString() === commentId);
            if (!comment) {
                return res.status(404).json({ error: 'Comment not found' });
            }
            comment.likes += 1;
            await tool.save();
            res.status(200).json(tool);
        } catch (error) {
            logger('Error liking comment: %O', error);
            res.status(400).json({ error: 'Failed to like comment' });
        }
    }
};
