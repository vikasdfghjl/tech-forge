// filepath: c:\Users\shyvi\Projects\clg-project\tech-forge\frontend\src\components\tools\ToolCommentSection.tsx
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, Send, Loader2, MoreVertical, Edit, Trash2, X, Check } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Comment } from "../../hooks/useToolData";
import { toast } from "react-toastify";

export interface ToolCommentsProps {
  toolId: string;
  comments: Comment[];
  onAddComment: (text: string) => Promise<void>;
  onEditComment?: (commentId: string, text: string) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
  isCardLoading?: boolean;
  initiallyExpanded?: boolean; // New prop to control initial expansion state
  onToggleExpand?: (expanded: boolean) => void; // New prop to notify parent of expansion state changes
}

// Extend Comment interface to include possible properties from backend
interface CommentWithMetadata extends Comment {
  createdAt?: string | number | Date;
  _id?: string;
}

const ToolCommentSection = ({ 
  toolId, 
  comments, 
  onAddComment, 
  onEditComment, 
  onDeleteComment, 
  isCardLoading = false,
  initiallyExpanded = false, // Default to collapsed, but can be overridden
  onToggleExpand = undefined // Optional callback for parent components
}: ToolCommentsProps) => {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  // Rest of the component state
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState<{ id: string; text: string } | null>(null);
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  
  // Effect to sync isExpanded state with initiallyExpanded prop
  useEffect(() => {
    setIsExpanded(initiallyExpanded);
  }, [initiallyExpanded]);
  
  // References
  const commentInputRef = useRef<HTMLInputElement>(null);
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Auto-focus comment input when comments section is expanded
  useEffect(() => {
    if (isExpanded && commentInputRef.current && !isCardLoading) {
      commentInputRef.current.focus();
    }
  }, [isExpanded, isCardLoading]);
  
  // Auto-focus edit input when editing starts
  useEffect(() => {
    if (editingComment && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingComment]);
  
  // Scroll to bottom of comments when new ones are added
  useEffect(() => {
    if (isExpanded && commentsContainerRef.current) {
      commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
    }
  }, [comments.length, isExpanded]);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenFor(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
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
  
  // Helper to check if the current user is the author of the comment
  const isCommentAuthor = (comment: CommentWithMetadata): boolean => {
    if (!user || !isAuthenticated) return false;
    
    // Check authorId against current user's ID
    if (comment.authorId) {
      return comment.authorId === user._id;
    }
    
    // If the author is an object, check its _id
    if (typeof comment.author === 'object' && comment.author) {
      const authorObj = comment.author as { _id?: string };
      return authorObj._id === user._id;
    }
    
    // In this case, we can't determine if the user is the author
    return false;
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
  
  const handleStartEditing = (comment: CommentWithMetadata) => {
    setEditingComment({
      id: comment.id || comment._id || "",
      text: comment.text
    });
    setMenuOpenFor(null);
  };
  
  const handleCancelEdit = () => {
    setEditingComment(null);
  };
  
  const handleSaveEdit = async () => {
    if (!editingComment || !editingComment.text.trim() || !onEditComment) return;
    
    try {
      await onEditComment(editingComment.id, editingComment.text.trim());
      setEditingComment(null);
    } catch (error) {
      console.error("Error saving comment edit:", error);
    }
  };
  
  const handleDeleteComment = async (commentId: string) => {
    if (!onDeleteComment) return;
    
    try {
      await onDeleteComment(commentId);
      setMenuOpenFor(null);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };
  
  const toggleMenu = (commentId: string) => {
    setMenuOpenFor(prevId => prevId === commentId ? null : commentId);
  };
  
  // Ensure comments is always an array even if it's undefined
  const safeComments = Array.isArray(comments) ? comments.map(c => c as CommentWithMetadata) : [];
  
  // Function to toggle comment section visibility
  const toggleCommentsVisibility = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    
    // Notify parent component if callback is provided
    if (onToggleExpand) {
      onToggleExpand(newExpandedState);
    }
  };
  
  return (
    <div className="mt-4 pt-2 border-t border-gray-100">
      {/* Comment counter and toggle button */}
      <button
        onClick={toggleCommentsVisibility}
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
      
      {/* Comments section that expands/collapses */}
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
                  {safeComments.map((comment) => {
                    const commentId = comment.id || comment._id || `comment-${comment.timestamp}-${comment.author}`;
                    const isEditing = editingComment && editingComment.id === commentId;
                    const isAuthor = isCommentAuthor(comment);
                    
                    return (
                      <motion.div
                        key={commentId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-50 rounded-lg p-3 text-sm relative"
                        role="article"
                        aria-label={`Comment by ${getAuthorName(comment.author)}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-gray-900">{getAuthorName(comment.author)}</span>
                          <div className="flex items-center gap-2">
                            <time 
                              dateTime={new Date(comment.timestamp || comment.createdAt || 0).toISOString()}
                              className="text-xs text-gray-500"
                            >
                              {formatDate(comment.timestamp || comment.createdAt)}
                            </time>
                            
                            {/* Three-dot menu for comment owner */}
                            {isAuthor && (
                              <div className="relative">
                                <button 
                                  onClick={() => toggleMenu(commentId)}
                                  className="p-1 rounded-full hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                                  aria-label="Comment options"
                                >
                                  <MoreVertical size={14} />
                                </button>
                                
                                {/* Dropdown menu */}
                                {menuOpenFor === commentId && (
                                  <div 
                                    ref={menuRef}
                                    className="absolute right-0 top-6 bg-white shadow-md rounded-md py-1 w-32 z-10 border border-gray-200"
                                  >
                                    <button
                                      onClick={() => handleStartEditing(comment)}
                                      className="flex items-center gap-2 px-3 py-2 w-full hover:bg-gray-100 transition-colors text-left"
                                    >
                                      <Edit size={14} />
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteComment(commentId)}
                                      className="flex items-center gap-2 px-3 py-2 w-full hover:bg-gray-100 transition-colors text-left text-red-600"
                                    >
                                      <Trash2 size={14} />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Show edit form or comment text */}
                        {isEditing ? (
                          <div className="mt-1">
                            <input
                              ref={editInputRef}
                              type="text"
                              value={editingComment.text}
                              onChange={(e) => setEditingComment(prev => prev ? {...prev, text: e.target.value} : prev)}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <button
                                onClick={handleCancelEdit}
                                className="flex items-center gap-1 px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs transition-colors"
                              >
                                <X size={12} />
                                <span>Cancel</span>
                              </button>
                              <button
                                onClick={handleSaveEdit}
                                className="flex items-center gap-1 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs transition-colors"
                                disabled={!editingComment.text.trim()}
                              >
                                <Check size={12} />
                                <span>Save</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-700 break-words">{comment.text}</p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ToolCommentSection;