import { Request, Response } from "express";
import Tool from "../models/Tool";

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
  createTool: async (req: Request, res: Response): Promise<void> => {
    console.log("createTool called", req.body);
    try {
      const { name, description } = req.body;
      if (!name || !description) {
        res.status(400).json({ message: "Name and description are required" });
        return;
      }
      const newTool = new Tool({ name, description });
      await newTool.save();
      res.status(201).json(newTool);
    } catch (error) {
      console.error("Error creating tool:", error);
      res.status(500).json({ message: "Failed to create tool", error });
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
  }
};

export = toolController;
