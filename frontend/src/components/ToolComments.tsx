import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, Send } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Comment } from "../hooks/useToolData";

export interface ToolCommentsProps {
  toolId: string;
  comments: Comment[];
  onAddComment: (text: string) => Promise<void>;
}

const ToolComments = ({ toolId, comments, onAddComment }: ToolCommentsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [commentText, setCommentText] = useState("");
  const { isAuthenticated } = useAuth();
  
  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      await onAddComment(commentText.trim());
      setCommentText("");
    }
  };
  
  // Ensure comments is always an array even if it's undefined
  const safeComments = Array.isArray(comments) ? comments : [];
  
  return (
    <div className="mt-4 pt-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <MessageSquare size={14} />
        <span>{safeComments.length} {safeComments.length === 1 ? "comment" : "comments"}</span>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-1.5 text-sm rounded-full border border-input bg-background focus:border-primary/50 outline-none transition-all"
                disabled={!isAuthenticated}
              />
              <button
                type="submit"
                disabled={!commentText.trim() || !isAuthenticated}
                className="p-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </form>
            
            <div className="space-y-3 mt-3 max-h-[300px] overflow-y-auto pr-1">
              {safeComments.length === 0 ? (
                <p className="text-sm text-muted-foreground italic py-2">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                safeComments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-secondary/50 rounded-lg p-3 text-sm"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium">{comment.author}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comment.timestamp)}
                      </span>
                    </div>
                    <p>{comment.text}</p>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ToolComments;
