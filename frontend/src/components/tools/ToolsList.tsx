// filepath: c:\Users\shyvi\Projects\clg-project\tech-forge\frontend\src\components\tools\ToolsList.tsx
import { useState, useEffect, useRef } from 'react';
import { Tool, useToolData } from '../../hooks/useToolData';
import { toast } from 'react-toastify';
import { LoaderCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import ToolCard from '../ToolCard';

interface ToolsListProps {
  tools: (Tool & { id?: string; _id?: string; bookmarked?: boolean })[];
  onToolUpdate: (toolId: string, updatedData: Partial<Tool>) => void;
  onToolDelete: (toolId: string) => void;
}

const ToolsList = ({ tools, onToolUpdate, onToolDelete }: ToolsListProps) => {
  const { bookmarkTool, getBookmarkedTools } = useToolData();
  const { isAuthenticated } = useAuth();
  const [toolsWithStatus, setToolsWithStatus] = useState<(Tool & { id?: string; _id?: string; bookmarked?: boolean })[]>([]);
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const getBookmarkedToolsRef = useRef(getBookmarkedTools);
  
  // Update ref when getBookmarkedTools changes
  useEffect(() => {
    getBookmarkedToolsRef.current = getBookmarkedTools;
  }, [getBookmarkedTools]);
  
  // Fetch bookmarked tools and update status when component mounts or authentication changes
  useEffect(() => {
    let isMounted = true;
    const syncBookmarkStatuses = async () => {
      // Initialize with passed tools first
      if (isMounted) {
        setToolsWithStatus(tools);
      }
      
      // Only proceed if user is authenticated
      if (!isAuthenticated) {
        return;
      }
      
      try {
        // Fetch user's bookmarked tools
        const bookmarkedTools = await getBookmarkedToolsRef.current();
        
        if (!isMounted) return;
        
        console.log("Fetched user's bookmarked tools:", bookmarkedTools);
        
        // Extract bookmarked tool IDs into a Set for efficient lookups
        const bookmarkedIdsSet = new Set<string>();
        
        if (Array.isArray(bookmarkedTools)) {
          bookmarkedTools.forEach((tool: any) => {
            if (tool._id) bookmarkedIdsSet.add(tool._id);
          });
        } else if (bookmarkedTools && typeof bookmarkedTools === 'object') {
          // Handle different possible API response formats
          const toolsArray = 
            (bookmarkedTools.bookmarkedTools && Array.isArray(bookmarkedTools.bookmarkedTools) ? bookmarkedTools.bookmarkedTools : []) || 
            (bookmarkedTools.tools && Array.isArray(bookmarkedTools.tools) ? bookmarkedTools.tools : []) || 
            (bookmarkedTools.bookmarks && Array.isArray(bookmarkedTools.bookmarks) ? bookmarkedTools.bookmarks : []) ||
            [];
          
          toolsArray.forEach((tool: any) => {
            if (tool._id) bookmarkedIdsSet.add(tool._id);
          });
        }
        
        if (!isMounted) return;
        
        // Store for reference
        setBookmarkedIds(bookmarkedIdsSet);
        console.log("Bookmarked IDs set:", [...bookmarkedIdsSet]);
        
        // Mark tools as bookmarked if they're in the user's bookmarked list
        const updatedTools = tools.map(tool => {
          // Ensure we have an ID to work with
          const toolId = tool._id || tool.id;
          if (!toolId) return tool;
          
          return {
            ...tool,
            bookmarked: bookmarkedIdsSet.has(toolId)
          };
        });
        
        console.log("Updated tools with bookmark status:", 
          updatedTools.map(t => ({id: t._id, bookmarked: t.bookmarked}))
        );
        
        if (isMounted) {
          setToolsWithStatus(updatedTools);
        }
      } catch (error) {
        console.error('Error syncing bookmark statuses:', error);
      }
    };

    // Sync bookmark statuses when tools change or auth status changes
    syncBookmarkStatuses();
    
    return () => {
      isMounted = false;
    };
  }, [tools, isAuthenticated]); // Removed getBookmarkedTools from dependencies
  
  // Helper to set loading state for a specific operation
  const setLoading = (toolId: string, operation: string, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [`${toolId}-${operation}`]: isLoading
    }));
  };

  // Accessibility helper: Announce status to screen readers
  const announceToScreenReader = (message: string) => {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.className = 'sr-only';
    announcer.innerText = message;
    document.body.appendChild(announcer);
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 3000);
  };

  const handleUpvote = async (toolId: string) => {
    try {
      setLoading(toolId, 'upvote', true);
      
      // Get the current upvote count for proper incrementing
      const currentTool = toolsWithStatus.find(t => (t._id || t.id) === toolId);
      const currentUpvotes = currentTool?.upvotes || 0;
      
      // Optimistic UI update
      setToolsWithStatus(prevTools => 
        prevTools.map(tool => 
          (tool._id === toolId || tool.id === toolId) 
            ? { ...tool, upvotes: currentUpvotes + 1 } 
            : tool
        )
      );
      
      // Update tool in parent component
      await onToolUpdate(toolId, { upvotes: currentUpvotes + 1 });
      
      // Show success message with proper contrast and positioning
      toast.success(`Upvoted tool successfully`, { 
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
      });
      
      // Announce for screen readers
      announceToScreenReader(`Tool upvoted successfully`);
    } catch (error) {
      console.error('Error upvoting:', error);
      
      // Revert the optimistic update
      setToolsWithStatus(prevTools => [...tools]);
      
      // Show error with accessible colors
      toast.error(`Failed to upvote tool. Please try again.`, {
        position: "bottom-right",
        autoClose: 4000,
      });
      
      setErrorMessage("Failed to upvote. Please try again.");
    } finally {
      setLoading(toolId, 'upvote', false);
    }
  };

  const handleWant = async (toolId: string) => {
    try {
      setLoading(toolId, 'want', true);
      
      // Get the current want count for proper incrementing
      const currentTool = toolsWithStatus.find(t => (t._id || t.id) === toolId);
      const currentWants = currentTool?.wants || 0;
      
      // Optimistic UI update for immediate feedback
      setToolsWithStatus(prevTools => 
        prevTools.map(tool => 
          (tool._id === toolId || tool.id === toolId) 
            ? { ...tool, wants: currentWants + 1 } 
            : tool
        )
      );
      
      // Update tool in parent component
      await onToolUpdate(toolId, { wants: currentWants + 1 });
      
      toast.success(`Marked as wanted successfully`, {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
      });
      
      // Announce for screen readers
      announceToScreenReader(`Tool marked as wanted successfully`);
    } catch (error) {
      console.error('Error marking as wanted:', error);
      
      // Revert the optimistic update
      setToolsWithStatus(prevTools => [...tools]);
      
      toast.error(`Failed to mark as wanted. Please try again.`, {
        position: "bottom-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(toolId, 'want', false);
    }
  };

  const handleBookmark = async (toolId: string) => {
    try {
      setLoading(toolId, 'bookmark', true);
      
      // Get current bookmark state
      const currentTool = toolsWithStatus.find(t => (t._id || t.id) === toolId);
      const isCurrentlyBookmarked = currentTool?.bookmarked || false;
      console.log(`Toggling bookmark for tool ${toolId}. Current state:`, isCurrentlyBookmarked);
      
      // Optimistic UI update for immediate feedback
      setToolsWithStatus(prevTools => {
        const updatedTools = prevTools.map(tool => 
          (tool._id === toolId || tool.id === toolId) 
            ? { ...tool, bookmarked: !isCurrentlyBookmarked } 
            : tool
        );
        console.log("Updated tools after optimistic update:", updatedTools.map(t => ({id: t._id, bookmarked: t.bookmarked})));
        return updatedTools;
      });
      
      // Call the API to toggle bookmark
      const response = await bookmarkTool(toolId);
      console.log("Bookmark response from server:", response);
      
      // Define the response type to access its properties safely
      const bookmarkResponse = response as { bookmarked: boolean; message: string };
      
      // Update the local state with the response from the server
      setToolsWithStatus(prevTools => {
        const updatedTools = prevTools.map(tool => 
          (tool._id === toolId || tool.id === toolId) 
            ? { ...tool, bookmarked: bookmarkResponse.bookmarked } 
            : tool
        );
        console.log("Updated tools after server response:", updatedTools.map(t => ({id: t._id, bookmarked: t.bookmarked})));
        return updatedTools;
      });
      
      // Update parent component state to ensure consistency
      onToolUpdate(toolId, { bookmarked: bookmarkResponse.bookmarked });
      
      toast.success(bookmarkResponse.message, {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
      });
      
      // Announce for screen readers
      announceToScreenReader(bookmarkResponse.message);
    } catch (error) {
      console.error('Error bookmarking tool:', error);
      
      // Revert the optimistic update
      const currentTool = toolsWithStatus.find(t => (t._id || t.id) === toolId);
      const isCurrentlyBookmarked = currentTool?.bookmarked || false;
      
      setToolsWithStatus(prevTools => 
        prevTools.map(tool => 
          (tool._id === toolId || tool.id === toolId) 
            ? { ...tool, bookmarked: isCurrentlyBookmarked } 
            : tool
        )
      );
      
      toast.error(`Failed to bookmark tool. Please try again.`, {
        position: "bottom-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(toolId, 'bookmark', false);
    }
  };

  const handleAddComment = async (toolId: string, text: string) => {
    try {
      setLoading(toolId, 'comment', true);
      
      console.log("Adding comment to tool", toolId, text);
      
      if (!text.trim()) {
        toast.error("Comment cannot be empty");
        return;
      }
      
      // Find the tool
      const tool = toolsWithStatus.find(t => (t._id || t.id) === toolId);
      if (tool) {
        // Create a new comment object
        const newComment = { 
          id: Date.now().toString(), 
          text, 
          timestamp: Date.now(), 
          author: 'Current User' 
        };
        
        // Optimistic UI update
        setToolsWithStatus(prevTools =>
          prevTools.map(t =>
            (t._id === toolId || t.id === toolId)
              ? { ...t, comments: [...(t.comments || []), newComment] }
              : t
          )
        );
        
        // Update the tool with the new comment
        const updatedComments = [...(tool.comments || []), newComment];
        await onToolUpdate(toolId, { comments: updatedComments });
        
        toast.success('Comment added successfully', {
          position: "bottom-right",
          autoClose: 2000,
          hideProgressBar: false,
        });
        
        // Announce for screen readers
        announceToScreenReader('Comment added successfully');
        return;
      }
      toast.error('Could not find tool to add comment');
    } catch (error) {
      console.error('Error adding comment:', error);
      
      // Revert optimistic update
      setToolsWithStatus(prevTools => [...tools]);
      
      toast.error('Failed to add comment. Please try again.');
    } finally {
      setLoading(toolId, 'comment', false);
    }
  };

  // Show loading state if no tools are available yet
  if (toolsWithStatus.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-500 space-y-4">
        <LoaderCircle className="animate-spin h-10 w-10" />
        <p>Loading tools...</p>
      </div>
    );
  }

  // Show error message if present
  if (errorMessage) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4" role="alert">
        <p className="text-red-700">{errorMessage}</p>
        <button 
          onClick={() => setErrorMessage(null)} 
          className="text-sm text-red-500 hover:text-red-700 mt-2 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
          aria-label="Dismiss error message"
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4" aria-live="polite">
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
          isLoading={
            loadingStates[`${tool._id || tool.id}-upvote`] ||
            loadingStates[`${tool._id || tool.id}-want`] ||
            loadingStates[`${tool._id || tool.id}-bookmark`] ||
            loadingStates[`${tool._id || tool.id}-comment`] ||
            false
          }
        />
      ))}
    </div>
  );
};

export default ToolsList;