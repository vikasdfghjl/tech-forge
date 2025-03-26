
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, ChevronDown, ChevronUp } from "lucide-react";
import { Comment } from "../hooks/useToolData";

type ToolCommentsProps = {
  comments: Comment[];
  onAddComment: (text: string) => void;
};

const ToolComments = ({ comments = [], onAddComment }: ToolCommentsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [commentText, setCommentText] = useState("");
  
  const formatDate = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onAddComment(commentText.trim());
      setCommentText("");
    }
  };

  // Ensure comments is always an array
  const safeComments = Array.isArray(comments) ? comments : [];
  const totalComments = safeComments.length;
  
  return (
    <div className="mt-4 pt-3 border-t border-border/40">
      <button 
        className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="flex items-center gap-1.5">
          <MessageCircle size={16} />
          <span>{totalComments} Comment{totalComments !== 1 ? 's' : ''}</span>
        </span>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
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
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
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
