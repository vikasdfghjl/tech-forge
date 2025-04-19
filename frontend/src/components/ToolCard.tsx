import { motion } from "framer-motion";
import { ThumbsUp, Briefcase, Clock, Bookmark, Loader2 } from "lucide-react"; 
import { Tool, useToolData } from "../hooks/useToolData";
import ToolCommentSection from "./tools/ToolCommentSection";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useState, useRef, useEffect } from "react";

type ToolCardProps = {
  tool: Tool & { id?: string; _id?: string; bookmarked?: boolean };
  onUpvote: (id: string) => void;
  onWant: (id: string) => void;
  onAddComment: (toolId: string, text: string) => void;
  onDelete: () => void;
  onUpdate: (updatedData: Partial<Tool>) => void;
  onBookmark?: (id: string) => void;
  index: number;
  isLoading?: boolean;
  hideAdminButtons?: boolean; // New prop to control visibility of admin buttons
  hideInteractionButtons?: boolean; // New prop to control visibility of upvote and want buttons
}

const ToolCard = ({ 
  tool, 
  onUpvote, 
  onWant, 
  onAddComment, 
  onDelete, 
  onUpdate, 
  onBookmark = () => {}, 
  index,
  isLoading = false,
  hideAdminButtons = false, // Default to showing admin buttons
  hideInteractionButtons = false // Default to showing interaction buttons
}: ToolCardProps) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { editComment, deleteComment } = useToolData();
  const cardRef = useRef<HTMLDivElement>(null);
  
  const [upvoteCount, setUpvoteCount] = useState(tool.upvotes || 0);
  const [userUpvoted, setUserUpvoted] = useState(false);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(!!tool.bookmarked);
  
  // Check if onDelete and onUpdate are meaningful functions (not empty)
  const hasDeleteFunction = onDelete.toString() !== (() => {}).toString() && !hideAdminButtons;
  const hasUpdateFunction = onUpdate.toString() !== (() => {}).toString() && !hideAdminButtons;
  
  // Check if onUpvote and onWant are meaningful functions
  const hasUpvoteFunction = onUpvote.toString() !== (() => {}).toString() && !hideInteractionButtons;
  const hasWantFunction = onWant.toString() !== (() => {}).toString() && !hideInteractionButtons;
  
  // Update local state when tool prop changes - especially bookmarked status
  useEffect(() => {
    console.log(`Tool ${tool._id || tool.id} updated:`, { bookmarked: tool.bookmarked, upvotes: tool.upvotes });
    // Use !! to ensure boolean value regardless of what tool.bookmarked is (could be undefined)
    const bookmarked = !!tool.bookmarked;
    setIsBookmarked(bookmarked);
    setUpvoteCount(tool.upvotes || 0);
  }, [tool._id, tool.id, tool.bookmarked, tool.upvotes]);
  
  // Keyboard accessibility handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFocused) return;

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsExpanded(!isExpanded);
      }
    };

    // Get a reference to the current DOM node
    const currentRef = cardRef.current;

    if (currentRef) {
      currentRef.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      // Use the captured reference in the cleanup function
      if (currentRef) {
        currentRef.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [isFocused, isExpanded]);

  // Format timestamp for display
  const formatDate = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) {
      return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
    }
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };
  
  const handleUpvote = async () => {
    try {
      if (!isAuthenticated) {
        toast.error("Please log in to upvote tools", {
          position: "bottom-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
        navigate("/login");
        return;
      }
      
      const toolId = tool._id || tool.id;
      if (!toolId) {
        console.error("Tool ID is missing!");
        toast.error("Cannot upvote: Tool ID is missing");
        return;
      }
      
      setIsUpvoting(true);
      await onUpvote(toolId);
      
      // Since onUpvote doesn't return a value, just update the local state
      setUpvoteCount(prevCount => prevCount + 1);
      setUserUpvoted(true);
    } catch (error) {
      console.error("Upvote error:", error);
      // Check if it's an auth error and handle accordingly
      if (error instanceof Error && error.message.includes("Authentication required")) {
        navigate("/login");
      }
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleWant = async () => {
    try {
      const toolId = tool._id || tool.id;
      if (!toolId) {
        console.error("Tool ID is missing!");
        toast.error("Cannot mark as wanted: Tool ID is missing", {
          position: "bottom-right"
        });
        return;
      }
      
      if (!isAuthenticated) {
        toast.error("Please log in to mark tools as wanted", {
          position: "bottom-right",
          autoClose: 4000
        });
        navigate("/login");
        return;
      }
      
      await onWant(toolId);
    } catch (error) {
      console.error("Error marking as wanted:", error);
    }
  };

  const handleBookmark = async () => {
    try {
      const toolId = tool._id || tool.id;
      if (!toolId) {
        console.error("Tool ID is missing!");
        toast.error("Cannot bookmark: Tool ID is missing", {
          position: "bottom-right"
        });
        return;
      }
      
      if (!isAuthenticated) {
        toast.error("Please log in to bookmark tools", {
          position: "bottom-right",
          autoClose: 4000
        });
        navigate("/login");
        return;
      }
      
      console.log(`Bookmark clicked for tool ${toolId}. Current state:`, isBookmarked);
      
      // Optimistic UI update for immediate feedback
      setIsBookmarked(prevState => !prevState);
      
      // Call the parent's onBookmark function - don't try to use the return value
      await onBookmark(toolId);
      
      // We're not setting state here based on the result because the component will
      // receive updated props from parent via the useEffect when tool.bookmarked changes
      
    } catch (error) {
      // Revert the optimistic update if there's an error
      setIsBookmarked(prevState => !prevState);
      console.error("Error bookmarking:", error);
      toast.error("Failed to update bookmark. Please try again.", {
        position: "bottom-right"
      });
    }
  };

  const handleAddComment = async (text: string) => {
    try {
      if (!isAuthenticated) {
        toast.error("Please log in to add comments", {
          position: "bottom-right",
          autoClose: 4000
        });
        navigate("/login");
        return Promise.reject(new Error("Authentication required"));
      }
      
      const toolId = tool._id || tool.id;
      if (!toolId) {
        console.error("Tool ID is missing!");
        toast.error("Cannot add comment: Tool ID is missing");
        return Promise.reject(new Error("Tool ID is missing"));
      }
      
      await onAddComment(toolId, text);
      return Promise.resolve();
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
      return Promise.reject(error);
    }
  };

  const handleEditComment = async (commentId: string, newText: string) => {
    try {
      if (!isAuthenticated) {
        toast.error("Please log in to edit comments", {
          position: "bottom-right",
          autoClose: 4000
        });
        navigate("/login");
        return Promise.reject(new Error("Authentication required"));
      }
      
      const toolId = tool._id || tool.id;
      if (!toolId) {
        console.error("Tool ID is missing!");
        toast.error("Cannot edit comment: Tool ID is missing");
        return Promise.reject(new Error("Tool ID is missing"));
      }
      
      await editComment(toolId, commentId, newText);
      return Promise.resolve();
    } catch (error) {
      console.error("Error editing comment:", error);
      toast.error("Failed to edit comment");
      return Promise.reject(error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      if (!isAuthenticated) {
        toast.error("Please log in to delete comments", {
          position: "bottom-right",
          autoClose: 4000
        });
        navigate("/login");
        return Promise.reject(new Error("Authentication required"));
      }
      
      const toolId = tool._id || tool.id;
      if (!toolId) {
        console.error("Tool ID is missing!");
        toast.error("Cannot delete comment: Tool ID is missing");
        return Promise.reject(new Error("Tool ID is missing"));
      }
      
      await deleteComment(toolId, commentId);
      return Promise.resolve();
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
      return Promise.reject(error);
    }
  };

  // Extract creator name safely
  const creatorName = typeof tool.creator === 'object' 
    ? tool.creator.username || tool.creator.name || 'Unknown User'
    : tool.creator || 'Unknown User';

  return (
    <motion.div
      ref={cardRef}
      className={`tool-card w-full p-4 border rounded-lg mb-4 shadow-sm transition-all duration-200 ${
        isFocused ? 'ring-2 ring-blue-400' : ''
      } ${isLoading ? 'opacity-70' : 'bg-white hover:shadow-md'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 * index }}
      layout
      tabIndex={0}
      role="article"
      aria-label={`Tool: ${tool.name} by ${creatorName}`}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsExpanded(!isExpanded);
        }
      }}
    >
      {/* Overlay for loading state */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center rounded-lg z-30">
          <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
        </div>
      )}
      
      {/* Bookmark button positioned at top right */}
      <motion.button
        className="absolute right-3 top-3 z-20 cursor-pointer focus:outline-none"
        onClick={handleBookmark}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.1 }}
        disabled={isLoading}
        aria-label={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
        aria-pressed={isBookmarked}
        data-bookmarked={isBookmarked ? "true" : "false"}
      >
        <Bookmark 
          size={20} 
          aria-hidden="true" 
          fill={isBookmarked ? "currentColor" : "none"} 
          className={isBookmarked ? 'text-blue-500' : 'text-blue-500'}
          strokeWidth={1.5}
        />
      </motion.button>
      
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg text-gray-900">{tool.name}</h3>
        
        {/* Only show admin buttons if they have meaningful functions */}
        {(hasDeleteFunction || hasUpdateFunction) && (
          <div className="flex space-x-2">
            {hasDeleteFunction && (
              <button
                onClick={onDelete}
                className="text-red-500 hover:text-red-700 transition-colors text-sm px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
                aria-label={`Delete ${tool.name}`}
              >
                Delete
              </button>
            )}
            {hasUpdateFunction && (
              <button
                onClick={() => onUpdate({ name: "Updated Name", description: "Updated Description" })}
                className="text-blue-500 hover:text-blue-700 transition-colors text-sm px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                aria-label={`Update ${tool.name}`}
              >
                Update
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center text-xs text-gray-500 mt-1 mb-2" aria-label="Posted date">
        <Clock size={12} className="mr-1" aria-hidden="true" />
        <time dateTime={new Date(tool.timestamp || 0).toISOString()}>{formatDate(tool.timestamp || 0)}</time>
      </div>
      
      <p className="text-gray-600 mb-4 text-sm">
        {tool.description}
      </p>
      
      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          by <span className="font-medium">{creatorName}</span>
        </div>
        
        <div className="flex items-center space-x-2" style={{minHeight: '40px'}}>
          {/* Only show upvote button if function is provided and not hidden */}
          {hasUpvoteFunction && (
            <motion.button
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-full ${
                userUpvoted 
                  ? 'bg-blue-100 hover:bg-blue-200' 
                  : 'bg-gray-100 hover:bg-gray-200'
              } transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50`}
              onClick={handleUpvote}
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.05 }}
              disabled={isUpvoting || isLoading}
              aria-label={`Upvote this tool. Current upvotes: ${tool.upvotes}`}
              aria-pressed={userUpvoted}
            >
              <ThumbsUp size={14} aria-hidden="true" className={userUpvoted ? 'text-blue-500' : ''} />
              <span className="text-sm font-medium" aria-hidden="true">{tool.upvotes}</span>
              <span className="sr-only">{tool.upvotes} upvotes</span>
            </motion.button>
          )}
          
          {/* Only show want button if function is provided and not hidden */}
          {hasWantFunction && (
            <motion.button
              className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-50"
              onClick={handleWant}
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.05 }}
              disabled={isLoading}
              aria-label={`Mark as wanted. Current wants: ${tool.wants}`}
            >
              <Briefcase size={14} aria-hidden="true" />
              <span className="text-sm font-medium" aria-hidden="true">{tool.wants}</span>
              <span className="sr-only">{tool.wants} people want this tool</span>
            </motion.button>
          )}
        </div>
      </div>

      <ToolCommentSection 
        toolId={tool._id || tool.id || ""}
        comments={tool.comments || []} 
        onAddComment={handleAddComment}
        onEditComment={handleEditComment}
        onDeleteComment={handleDeleteComment}
        isCardLoading={isLoading}
        initiallyExpanded={true} // Set initiallyExpanded to true for direct access
      />
    </motion.div>
  );
};

export default ToolCard;

