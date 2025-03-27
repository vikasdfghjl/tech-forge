import { useState, useEffect } from 'react';
import { Comment } from '@/types/index';

// Define the Tool type and export it
export type Tool = {
  id: string;
  name: string;
  description: string;
  creator: string;
  timestamp: number;
  upvotes: number;
  wants: number;
  comments: { id: string; text: string; timestamp: number }[];
};

export const useToolData = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tools from MongoDB
  const fetchTools = async () => {
    try {
      setLoading(true);
      // Use your existing backend API endpoint for fetching tools
      const response = await fetch('/api/tools');
      
      if (!response.ok) {
        throw new Error('Failed to fetch tools');
      }
      
      const data = await response.json();
      
      // Transform MongoDB _id to id if needed
      const formattedTools = data.map((tool: { _id: string; name: string; description: string; upvotes: number; wants: number; comments: Comment[] }) => ({
        ...tool,
        id: tool._id.toString(), // Ensure compatibility with your frontend
      }));
      
      setTools(formattedTools);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching tools:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch tools on component mount
  useEffect(() => {
    fetchTools();
  }, []);

  // Function to upvote a tool
  const upvoteTool = async (id: string) => {
    try {
      // Use your existing backend API endpoint for upvoting
      const response = await fetch(`/api/tools/${id}/upvote`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to upvote tool');
      }
      
      const updatedTool = await response.json();
      
      // Update local state with the response from the server
      setTools(tools.map(tool => 
        tool.id === id ? { ...updatedTool, id: updatedTool._id.toString() } : tool
      ));
    } catch (err) {
      console.error('Error upvoting tool:', err);
    }
  };

  // Function to mark a tool as "want to try"
  const wantTool = async (id: string) => {
    try {
      // Use your existing backend API endpoint for wanting a tool
      const response = await fetch(`/api/tools/${id}/want`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark tool as wanted');
      }
      
      const updatedTool = await response.json();
      
      // Update local state with the response from the server
      setTools(tools.map(tool => 
        tool.id === id ? { ...updatedTool, id: updatedTool._id.toString() } : tool
      ));
    } catch (err) {
      console.error('Error marking tool as wanted:', err);
    }
  };

  // Function to add a comment to a tool
  const addComment = async (toolId: string, commentText: string) => {
    try {
      const newComment = {
        text: commentText,
        user: 'currentUser', // In a real app, this would be from auth
      };
      
      // Use your existing backend API endpoint for adding comments
      const response = await fetch(`/api/tools/${toolId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newComment),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      
      const updatedTool = await response.json();
      
      // Update local state with the response from the server
      setTools(tools.map(tool => 
        tool.id === toolId ? { ...updatedTool, id: updatedTool._id.toString() } : tool
      ));
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  // Function to add a new tool
  const addTool = async (newTool: Omit<Tool, 'id' | 'upvotes' | 'wants' | 'comments'>) => {
    try {
      // Use your existing backend API endpoint for adding tools
      const response = await fetch('/api/tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTool),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add tool');
      }
      
      const addedTool = await response.json();
      
      // Update local state with the newly added tool, ensuring id compatibility
      setTools([...tools, { ...addedTool, id: addedTool._id.toString() }]);
    } catch (err) {
      console.error('Error adding tool:', err);
    }
  };

  // Function to delete a tool
  const deleteTool = async (id: string) => {
    try {
      // Use your existing backend API endpoint for deleting tools
      const response = await fetch(`/api/tools/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete tool');
      }
      
      // Update local state after successful API call
      setTools(tools.filter(tool => tool.id !== id));
    } catch (err) {
      console.error('Error deleting tool:', err);
    }
  };

  return { 
    tools, 
    loading, 
    error, 
    upvoteTool, 
    wantTool, 
    addComment, 
    addTool, 
    deleteTool,
    refreshTools: fetchTools 
  };
};
