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
      const result = await apiService.upvoteTool(id);
      
      setTools(prev => 
        prev.map(tool => 
          tool._id === id ? { ...tool, upvotes: result.upvotes } : tool
        )
      );
      
    } catch (err: unknown) {
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
      const result = await apiService.wantTool(id);
      
      setTools(prev => 
        prev.map(tool => 
          tool._id === id ? { ...tool, wants: result.wants } : tool
        )
      );
      
    } catch (err: unknown) {
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
      return;
    }

      try {
        const newComment = await apiService.addComment(toolId, commentText);
        
        setTools(prev => 
          prev.map(tool => {
            if (tool._id === toolId) {
              // Ensure the new comment matches our Comment interface
              const typedComment: Comment = {
                ...newComment,
                timestamp: Date.now() // Always set a new timestamp for consistency
              };
              const updatedComments = [...(tool.comments || []), typedComment];
              return { ...tool, comments: updatedComments };
            }
            return tool;
          })
        );
        
        toast.success("Comment added");
      } catch (err: unknown) {
        console.error("Error adding comment:", err);
        toast.error(err instanceof Error ? err.message : "Failed to add comment");
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
    };
  }
