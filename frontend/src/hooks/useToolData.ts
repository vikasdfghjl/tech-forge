import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import * as apiService from "../services/apiService";

export interface Tool {
  _id: string;
  name: string;
  description: string;
  upvotes: number;
  wants: number;
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
  creator?: string;
  timestamp?: number;
  bookmarked?: boolean; // Add bookmarked flag
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp?: number; // Make timestamp optional since it might not come from API
  _id?: string; // Add optional _id field to handle API responses
}

type NewTool = {
  name: string;
  description: string;
  creator?: string;
  timestamp?: number;
};

export function useToolData() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchTools = async () => {
    setIsLoading(true);
    try {
      const toolsData = await apiService.fetchTools();
      setTools(toolsData);
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load tools";
      console.error("Error fetching tools:", err);
      setError(errorMessage);
      toast.error("Failed to load tools");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const addTool = async (newTool: NewTool) => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to add a tool");
      return;
    }

    try {
      const createdTool = await apiService.createTool({
        name: newTool.name,
        description: newTool.description,
      });
      
      setTools(prev => [createdTool, ...prev]);
      toast.success("Tool added successfully");
    } catch (err: unknown) {
      console.error("Error adding tool:", err);
      toast.error(err instanceof Error ? err.message : "Failed to add tool");
    }
  };

  const upvoteTool = async (id: string) => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to upvote");
      return;
    }

    try {
      console.log(`Upvoting tool with ID: ${id}`);
      // Show visual feedback immediately
      toast.loading("Processing upvote...");
      
      const result = await apiService.upvoteTool(id);
      console.log("Upvote result:", result);
      
      // Update local state with the server response
      setTools(prev => 
        prev.map(tool => {
          if (tool._id === id) {
            console.log(`Updating tool ${tool._id}: upvotes from ${tool.upvotes} to ${result.upvotes}`);
            return { ...tool, upvotes: result.upvotes };
          }
          return tool;
        })
      );
      
      toast.dismiss();
      toast.success(result.userUpvoted ? "Upvoted!" : "Upvote removed!");
      
    } catch (err: unknown) {
      toast.dismiss();
      console.error("Error upvoting tool:", err);
      toast.error(err instanceof Error ? err.message : "Failed to upvote tool");
    }
  };

  const wantTool = async (id: string) => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to mark as wanted");
      return;
    }

    try {
      console.log(`Marking tool with ID: ${id} as wanted`);
      // Show visual feedback immediately
      toast.loading("Processing request...");
      
      const result = await apiService.wantTool(id);
      console.log("Want result:", result);
      
      // Update local state with the server response
      setTools(prev => 
        prev.map(tool => {
          if (tool._id === id) {
            console.log(`Updating tool ${tool._id}: wants from ${tool.wants} to ${result.wants}`);
            return { ...tool, wants: result.wants };
          }
          return tool;
        })
      );
      
      toast.dismiss();
      toast.success(result.userWanted ? "Added to wanted tools!" : "Removed from wanted tools!");
      
    } catch (err: unknown) {
      toast.dismiss();
      console.error("Error marking tool as wanted:", err);
      toast.error(err instanceof Error ? err.message : "Failed to mark tool as wanted");
    }
  };

  const deleteTool = async (id: string) => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to delete a tool");
      return;
    }

    try {
      await apiService.deleteTool(id);
      setTools(prev => prev.filter(tool => tool._id !== id));
    } catch (err: unknown) {
      console.error("Error deleting tool:", err);
      toast.error(err instanceof Error ? err.message : "Failed to delete tool");
    }
  };

  const addComment = async (toolId: string, commentText: string) => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to comment");
      throw new Error("Authentication required");
    }

    try {
      console.log("Adding comment to tool:", toolId, commentText);
      const newComment = await apiService.addComment(toolId, commentText);
      
      // Update the local state with the new comment
      setTools(prev => 
        prev.map(tool => {
          if (tool._id === toolId) {
            // Ensure the new comment matches our Comment interface
            const typedComment: Comment = {
              ...newComment,
              id: newComment.id || newComment._id || Date.now().toString(),
              author: newComment.author || "Anonymous",
              timestamp: newComment.timestamp || Date.now()
            };
            
            // Create a new array with the existing comments plus the new one
            const updatedComments = [...(tool.comments || []), typedComment];
            return { ...tool, comments: updatedComments };
          }
          return tool;
        })
      );
      
      toast.success("Comment added successfully");
      return newComment;
    } catch (err: unknown) {
      console.error("Error adding comment:", err);
      toast.error(err instanceof Error ? err.message : "Failed to add comment");
      throw err;
    }
  };

  // New function to handle bookmarking
  const bookmarkTool = async (id: string) => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to bookmark tools");
      throw new Error("Authentication required");
    }

    try {
      const response = await apiService.bookmarkTool(id);
      
      // Update the local state based on the response
      setTools(prevTools => 
        prevTools.map(tool => 
          tool._id === id
            ? { ...tool, bookmarked: response.bookmarked } 
            : tool
        )
      );
      
      return response;
    } catch (error) {
      console.error('Error bookmarking tool:', error);
      throw error;
    }
  };

  // Function to get bookmarked tools
  const getBookmarkedTools = async () => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to view bookmarked tools");
      throw new Error("Authentication required");
    }

    try {
      return await apiService.getBookmarkedTools();
    } catch (error) {
      console.error('Error fetching bookmarked tools:', error);
      throw error;
    }
  };
  
    return {
      tools,
      isLoading,
      error,
      addTool,
      upvoteTool,
      wantTool,
      deleteTool,
      addComment,
      bookmarkTool, // Add new bookmark function
      getBookmarkedTools, // Add function to get bookmarked tools
    };
  }
