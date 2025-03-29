import { useState, useEffect } from 'react';
import ToolCard from './ToolCard';
import { Tool, useToolData } from '../hooks/useToolData';
import { toast } from 'react-toastify';

interface ToolsListProps {
  tools: (Tool & { id?: string; _id?: string; bookmarked?: boolean })[];
  onToolUpdate: (toolId: string, updatedData: Partial<Tool>) => void;
  onToolDelete: (toolId: string) => void;
}

const ToolsList = ({ tools, onToolUpdate, onToolDelete }: ToolsListProps) => {
  const { bookmarkTool } = useToolData();
  const [toolsWithStatus, setToolsWithStatus] = useState<(Tool & { id?: string; _id?: string; bookmarked?: boolean })[]>([]);

  // Initialize tools with their status
  useEffect(() => {
    setToolsWithStatus(tools);
  }, [tools]);

  const handleUpvote = (toolId: string) => {
    // Handle upvote logic
    toast.success(`Upvoted tool ${toolId}`);
    // Update tool in parent component
    onToolUpdate(toolId, { upvotes: (tools.find(t => (t._id || t.id) === toolId)?.upvotes || 0) + 1 });
  };

  const handleWant = (toolId: string) => {
    // Handle want logic
    toast.success(`Marked tool ${toolId} as wanted`);
    // Update tool in parent component
    onToolUpdate(toolId, { wants: (tools.find(t => (t._id || t.id) === toolId)?.wants || 0) + 1 });
  };

  const handleBookmark = async (toolId: string) => {
    try {
      // Call the API to toggle bookmark
      const response = await bookmarkTool(toolId);
      
      // Define the response type to access its properties safely
      const bookmarkResponse = response as { bookmarked: boolean; message: string };
      
      // Update the local state with the response from the server
      setToolsWithStatus(prevTools => 
        prevTools.map(tool => 
          (tool._id === toolId || tool.id === toolId) 
            ? { ...tool, bookmarked: bookmarkResponse.bookmarked } 
            : tool
        )
      );
      
      toast.success(bookmarkResponse.message);
    } catch (error) {
      toast.error('Failed to bookmark tool');
      console.error('Error bookmarking tool:', error);
    }
  };

  const handleAddComment = async (toolId: string, text: string) => {
    try {
      console.log("Adding comment to tool", toolId, text);
      // If using a custom hook for tool data, call its addComment method
      if (onToolUpdate) {
        // First try to find the tool
        const tool = tools.find(t => (t._id || t.id) === toolId);
        if (tool) {
          // Create a new comment object
          const newComment = { 
            id: Date.now().toString(), 
            text, 
            timestamp: Date.now(), 
            author: 'Current User' 
          };
          
          // Update the tool with the new comment
          const updatedComments = [...(tool.comments || []), newComment];
          await onToolUpdate(toolId, { comments: updatedComments });
          toast.success('Comment added successfully');
          return;
        }
      }
      toast.error('Could not find tool to add comment');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
      throw error;
    }
  };

  return (
    <div className="space-y-4">
      {toolsWithStatus.map((tool, index) => (
        <ToolCard
          key={tool._id || tool.id || index}
          tool={tool}
          onUpvote={handleUpvote}
          onWant={handleWant}
          onBookmark={handleBookmark}
          onAddComment={handleAddComment}
          onDelete={() => onToolDelete(tool._id || tool.id || '')}
          onUpdate={(updatedData) => onToolUpdate(tool._id || tool.id || '', updatedData)}
          index={index}
        />
      ))}
    </div>
  );
};

export default ToolsList;
