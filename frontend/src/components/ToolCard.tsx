import { motion } from "framer-motion";
import { ThumbsUp, Briefcase, Clock, Bookmark, Loader2 } from "lucide-react"; 
import { Tool } from "../hooks/useToolData";
import ToolComments from "./ToolComments";
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
  isLoading = false
}: ToolCardProps) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);
  
  const [upvoteCount, setUpvoteCount] = useState(tool.upvotes || 0);
  const [userUpvoted, setUserUpvoted] = useState(false);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  // Keyboard accessibility handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFocused) return;

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsExpanded(!isExpanded);
      }
    };

    if (cardRef.current) {
      cardRef.current.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (cardRef.current) {
        cardRef.current.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [isFocused, isExpanded]);
  
  // Format timestamp to relative time (e.g., "2 days ago")
  const formatDate = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
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
      
      await onBookmark(toolId);
    } catch (error) {
      console.error("Error bookmarking:", error);
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
      
      {/* Bookmark button */}
      <div className="absolute top-3 right-3 z-20">
        <button
          className={`flex items-center justify-center w-9 h-9 rounded-full shadow border-2 ${
            tool.bookmarked 
              ? 'bg-red-500 text-white border-red-600' 
              : 'bg-white text-red-500 border-red-300'
          } hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400`}
          onClick={(e) => {
            e.stopPropagation();
            handleBookmark();
          }}
          title={tool.bookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
          data-testid="bookmark-button"
          aria-pressed={tool.bookmarked}
          aria-label={tool.bookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
        >
          <Bookmark 
            size={20} 
            fill={tool.bookmarked ? "currentColor" : "none"} 
            strokeWidth={2}
            className="pointer-events-none"
          />
        </button>
      </div>
      
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg text-gray-900">{tool.name}</h3>
        <div className="flex space-x-2 mr-10"> {/* Added margin to make space for bookmark icon */}
          <button
            onClick={onDelete}
            className="text-red-500 hover:text-red-700 transition-colors text-sm px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
            aria-label={`Delete ${tool.name}`}
          >
            Delete
          </button>
          <button
            onClick={() => onUpdate({ name: "Updated Name", description: "Updated Description" })}
            className="text-blue-500 hover:text-blue-700 transition-colors text-sm px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
            aria-label={`Update ${tool.name}`}
          >
            Update
          </button>
        </div>
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
        </div>
      </div>

      <ToolComments 
        toolId={tool._id || tool.id || ""}
        comments={tool.comments || []} 
        onAddComment={handleAddComment}
        isCardLoading={isLoading}
      />
    </motion.div>
  );
};

export default ToolCard;

