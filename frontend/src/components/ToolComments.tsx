import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Comment } from "../hooks/useToolData";
import { toast } from "react-toastify";

export interface ToolCommentsProps {
  toolId: string;
  comments: Comment[];
  onAddComment: (text: string) => Promise<void>;
  isCardLoading?: boolean;
}

// Extend Comment interface to include possible properties from backend
interface CommentWithMetadata extends Comment {
  createdAt?: string | number | Date;
  _id?: string;
}

const ToolComments = ({ toolId, comments, onAddComment, isCardLoading = false }: ToolCommentsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();
  
  const commentInputRef = useRef<HTMLInputElement>(null);
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  
  // Auto-focus comment input when comments section is expanded
  useEffect(() => {
    if (isExpanded && commentInputRef.current && !isCardLoading) {
      commentInputRef.current.focus();
    }
  }, [isExpanded, isCardLoading]);
  
  // Scroll to bottom of comments when new ones are added
  useEffect(() => {
    if (isExpanded && commentsContainerRef.current) {
      commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
    }
  }, [comments.length, isExpanded]);
  
  // Format date for display with better readability
  const formatDate = (date: string | number | Date | undefined) => {
    if (!date) return "Unknown date";
    
    try {
      // Handle different date formats
      const dateObj = date instanceof Date 
        ? date 
        : typeof date === 'number' 
          ? new Date(date) 
          : new Date(date);
      
      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        return "Unknown date";
      }
      
      // Show more readable format with time
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateObj);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Unknown date";
    }
  };
  
  // Helper to safely extract author name
  const getAuthorName = (author: string | object | undefined): string => {
    if (!author) return "Anonymous";
    
    // If author is a string, use it directly
    if (typeof author === 'string') return author;
    
    // If author is an object, try to get username, name, or email
    if (typeof author === 'object') {
      const authorObj = author as Record<string, string | undefined>;
      return authorObj.username || authorObj.name || authorObj.email || "Anonymous";
    }
    
    return "Anonymous";
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting || isCardLoading) return;
    
    try {
      setIsSubmitting(true);
      await onAddComment(commentText.trim());
      setCommentText("");
      // Toast notification is handled by parent component
    } catch (error) {
      console.error("Error submitting comment:", error);
      // Error handling is managed by parent component
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Ensure comments is always an array even if it's undefined
  const safeComments = Array.isArray(comments) ? comments.map(c => c as CommentWithMetadata) : [];
  
  return (
    <div className="mt-4 pt-2 border-t border-gray-100">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-1.5 text-sm ${
          isExpanded ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
        } transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 rounded-md px-2 py-1`}
        disabled={isCardLoading}
        aria-expanded={isExpanded}
        aria-controls="comments-section"
        aria-label={`${safeComments.length} comments. Click to ${isExpanded ? 'hide' : 'show'}`}
      >
        <MessageSquare size={14} aria-hidden="true" />
        <span>{safeComments.length} {safeComments.length === 1 ? "comment" : "comments"}</span>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            id="comments-section"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <form 
              onSubmit={handleSubmit} 
              className="mt-3 flex gap-2" 
              aria-label="Add comment form"
            >
              <input
                ref={commentInputRef}
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={isAuthenticated ? "Add a comment..." : "Login to comment"}
                className={`flex-1 px-3 py-1.5 text-sm rounded-full border ${
                  isAuthenticated 
                    ? 'border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100' 
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                } outline-none transition-all`}
                disabled={!isAuthenticated || isSubmitting || isCardLoading}
                aria-label="Comment text"
              />
              <button
                type="submit"
                disabled={!commentText.trim() || !isAuthenticated || isSubmitting || isCardLoading}
                className="p-1.5 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Submit comment"
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </form>
            
            <div 
              ref={commentsContainerRef}
              className="space-y-3 mt-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar"
              aria-live="polite"
            >
              {safeComments.length === 0 ? (
                <p key="no-comments" className="text-sm text-gray-500 italic py-2">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                <div key="comments-wrapper">
                  <h4 className="sr-only">Comments list</h4>
                  {safeComments.map((comment) => (
                    <motion.div
                      key={comment.id || comment._id || `comment-${comment.timestamp}-${comment.author}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 rounded-lg p-3 text-sm"
                      role="article"
                      aria-label={`Comment by ${getAuthorName(comment.author)}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-gray-900">{getAuthorName(comment.author)}</span>
                        <time 
                          dateTime={new Date(comment.timestamp || comment.createdAt || 0).toISOString()}
                          className="text-xs text-gray-500"
                        >
                          {formatDate(comment.timestamp || comment.createdAt)}
                        </time>
                      </div>
                      <p className="text-gray-700 break-words">{comment.text}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ToolComments;
