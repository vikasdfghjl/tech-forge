import express from "express";
import toolController from "../controllers/toolController";

const router = express.Router();

// Debug logging to verify imports
console.log("toolController:", toolController);

// Route to fetch all tools
router.get("/", toolController.getTools);

// Route to create a new tool
router.post("/", toolController.createTool);

// Route to update a tool
router.put("/:id", toolController.updateTool);

// Route to delete a tool
router.delete("/:id", toolController.deleteTool);

export default router;
