import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "./useAuth";
import apiService from '../utils/apiService';

export interface Tool {
  _id: string;
  name: string;
  description: string;
  upvotes: number;
  wants: number;
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
  creator: {
    _id: string;
    name: string;
    username: string; // Add username
  };
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

// Update the NewTool type to match our CreateToolPayload
type NewTool = {
  name: string;
  description: string;
  category?: string;
  website?: string;
  logo?: string;
  tags?: string[];
};

export function useToolData() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchTools = async () => {
    try {
      setIsLoading(true);
      
      // Add better error handling and logging
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tools`;
      console.log("Fetching tools from:", apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include credentials if your API requires authentication
      });

      // Log response details for debugging
      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers.entries()));

      // First check if response is ok before parsing JSON
      if (!response.ok) {
        // Try to get response text for better error messaging
        const errorText = await response.text();
        console.error("API Error Response:", errorText.substring(0, 200) + "...");
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      // Now parse JSON after confirming it's a successful response
      const data = await response.json();
      
      // Add logging to inspect the response data structure
      console.log("API Response structure:", Object.keys(data));
      
      // Transform the data if needed, with better handling of response structure
      const toolsData = Array.isArray(data) ? data : data.tools || [];
      console.log(`Received ${toolsData.length} tools`);
      
      setTools(toolsData);
      return toolsData;
    } catch (error) {
      console.error("Error fetching tools:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch tools");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const addTool = async (newTool: NewTool) => {
    console.log('🔍 addTool called with data:', { ...newTool, description: `${newTool.description?.substring(0, 20)}...` });
    console.log('🔐 Authentication status before API call:', { isAuthenticated });
    
    if (!isAuthenticated) {
      console.error('❌ Tool submission blocked - User not authenticated');
      toast.error("You must be logged in to add a tool");
      return;
    }

    try {
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tools`;
      console.log(`🌐 Submitting tool to: ${apiUrl}`);
      console.log('📤 Request headers include credentials:', { credentials: 'include' });
      console.log('🍪 Cookie status:', document.cookie ? `Cookies present (${document.cookie.split(';').length} items)` : 'No cookies found');
      
      // Make the request with credentials to include cookies for authentication
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTool),
        credentials: 'include', // Include cookies for authentication
      });

      console.log(`📥 Response status: ${response.status} (${response.statusText})`);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        console.error(`❌ Failed API response: ${response.status} ${response.statusText}`);
        
        // Try to get the response body for better error details
        try {
          const errorData = await response.json();
          console.error('❌ Error response data:', errorData);
          throw new Error(errorData.message || `Error: ${response.status}`);
        } catch (jsonError) {
          // If we can't parse JSON, try to get text
          const errorText = await response.text().catch(() => null);
          console.error('❌ Error response text:', errorText);
          throw new Error(`Error: ${response.status} - ${errorText || response.statusText}`);
        }
      }
      
      const createdTool = await response.json();
      console.log('✅ Tool created successfully:', { id: createdTool._id, name: createdTool.name });
      
      setTools(prev => [createdTool, ...prev]);
      toast.success("Tool added successfully");
      return createdTool;
    } catch (err: unknown) {
      console.error("❌ Error adding tool:", err);
      // Check if it's an authentication error
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('Authentication') || 
          errorMessage.includes('authentication') ||
          errorMessage.includes('unauthorized') || 
          errorMessage.includes('401')) {
        console.error('❌ Authentication failure detected');
        toast.error("Authentication error. Please try logging in again.");
      } else {
        toast.error(errorMessage || "Failed to add tool");
      }
      throw err;
    }
  };

  const upvoteTool = async (toolId: string): Promise<{ upvotes: number; userUpvoted: boolean }> => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to upvote");
      throw new Error("Authentication required");
    }

    try {
      const data = await apiService.upvoteTool(toolId);
      
      // Update the local tools state with the new upvote count
      setTools(prev => 
        prev.map(tool => {
          if (tool._id === toolId) {
            console.log(`Updating tool ${tool._id}: upvotes from ${tool.upvotes} to ${data.upvotes}`);
            return { ...tool, upvotes: data.upvotes };
          }
          return tool;
        })
      );
      
      // Show success message
      if (data.userUpvoted) {
        toast.success("Tool upvoted!");
      } else {
        toast.success("Upvote removed");
      }

      return {
        upvotes: data.upvotes || 0,
        userUpvoted: data.userUpvoted || false
      };
    } catch (error) {
      console.error('Error upvoting tool:', error);
      throw error;
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
      await apiService.request(`/tools/${id}`, {
        method: 'DELETE',
      });
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
      const newComment = await apiService.post(`/tools/${toolId}/comments`, { text: commentText });
      
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

  // New function to handle bookmarking with improved UI feedback
  const bookmarkTool = async (id: string) => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to bookmark tools");
      throw new Error("Authentication required");
    }

    try {
      // Optimistic update for immediate UI feedback
      setTools(prevTools => 
        prevTools.map(tool => 
          tool._id === id
            ? { ...tool, bookmarked: !tool.bookmarked } 
            : tool
        )
      );
      
      // Show loading toast
      toast.loading("Updating bookmark...");
      
      const response = await apiService.bookmarkTool(id);
      
      // Finalize the state update with the server response
      setTools(prevTools => 
        prevTools.map(tool => 
          tool._id === id
            ? { ...tool, bookmarked: response.bookmarked } 
            : tool
        )
      );
      
      toast.dismiss();
      toast.success(response.bookmarked ? "Added to bookmarks" : "Removed from bookmarks");
      return response;
    } catch (error) {
      // Revert optimistic update on error
      setTools(prevTools => 
        prevTools.map(tool => 
          tool._id === id
            ? { ...tool, bookmarked: !tool.bookmarked } 
            : tool
        )
      );
      
      toast.dismiss();
      console.error('Error bookmarking tool:', error);
      toast.error("Failed to update bookmark");
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
  
  // Function to get tools posted by the current user
  const getPostedTools = async () => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to view your posted tools");
      throw new Error("Authentication required");
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tools/user/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.tools || [];
    } catch (error) {
      console.error('Error fetching posted tools:', error);
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
    getPostedTools, // Add the new function to the return object
  };
}
