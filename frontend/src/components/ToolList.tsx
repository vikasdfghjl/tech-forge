import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Briefcase, MessageSquare, Trash2, ChevronDown, ChevronUp, Bookmark } from "lucide-react";
import { Tool, useToolData } from "../hooks/useToolData";
import { useAuth } from "../hooks/useAuth";
import ToolForm from "./ToolForm";
import ToolComments from "./ToolComments";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

type ToolListProps = {
  tools: Tool[];
  onUpvote: (id: string) => Promise<void>;
  onWant: (id: string) => Promise<void>;
  onAddComment: (toolId: string, commentText: string) => Promise<void>;
  onAddTool: (name: string, description: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  showSubmitForm: boolean;
  setShowSubmitForm: (show: boolean) => void;
};

const ToolList = ({
  tools,
  onUpvote,
  onWant,
  onAddComment,
  onAddTool,
  onDelete,
  showSubmitForm,
  setShowSubmitForm,
}: ToolListProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const { user, isAuthenticated } = useAuth();
  const { bookmarkTool } = useToolData();
  const [bookmarkedTools, setBookmarkedTools] = useState<Record<string, boolean>>({});
  
  // Initialize bookmarked state from props
  useEffect(() => {
    if (tools && tools.length > 0) {
      const initialBookmarkState: Record<string, boolean> = {};
      tools.forEach(tool => {
        if (tool._id) {
          initialBookmarkState[tool._id] = !!tool.bookmarked;
        }
      });
      setBookmarkedTools(initialBookmarkState);
    }
  }, [tools]);

  const handleToolSubmit = async (name: string, description: string) => {
    setIsSubmitting(true);
    try {
      await onAddTool(name, description);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleComments = (toolId: string) => {
    setExpandedComments(prev => ({
      ...prev,
      [toolId]: !prev[toolId]
    }));
  };

  // Handle bookmarking a tool
  const handleBookmark = async (toolId: string) => {
    if (!isAuthenticated) {
      return;
    }
    
    try {
      // Optimistic UI update
      setBookmarkedTools(prev => ({
        ...prev,
        [toolId]: !prev[toolId]
      }));
      
      // Call the API and get the response
      const response = await bookmarkTool(toolId);
      
      // Update with the actual server response to ensure consistency
      if (response && typeof response.bookmarked === 'boolean') {
        setBookmarkedTools(prev => ({
          ...prev,
          [toolId]: response.bookmarked
        }));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      // Revert on error
      setBookmarkedTools(prev => ({
        ...prev,
        [toolId]: !prev[toolId]
      }));
    }
  };

  // Ensure tools is always an array even if it's undefined
  const safeTools = Array.isArray(tools) ? tools : [];

  return (
    <div className="space-y-6 w-full">
      {/* Tool submission form - conditionally rendered */}
      <AnimatePresence>
        {showSubmitForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="glass-card p-6 rounded-xl border border-primary/20 shadow-sm bg-card">
              <h3 className="text-lg font-medium mb-4">Submit Your Tool Idea</h3>
              <ToolForm 
                onSubmit={handleToolSubmit} 
                isSubmitting={isSubmitting} 
                onCancel={() => setShowSubmitForm(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          Tool Ideas 
          <Badge variant="outline" className="ml-2">{safeTools.length}</Badge>
        </h2>
        
        {safeTools.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground rounded-xl border bg-card/50">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="text-6xl opacity-20 mb-4">🛠️</div>
              <h3 className="text-lg font-medium">No tools found</h3>
              <p className="text-sm mt-2">Be the first to submit an idea!</p>
              <Button 
                className="mt-4" 
                onClick={() => setShowSubmitForm(true)}
              >
                Submit Idea
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {safeTools.map((tool) => (
              <motion.div
                key={tool._id}
                className="tool-card bg-card border border-border/50 p-5 rounded-xl shadow-sm hover:shadow-md transition-all hover:border-primary/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium">{tool.name}</h3>
                  
                  {isAuthenticated && user?.role === "admin" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(tool._id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
                
                <p className="mt-2 text-muted-foreground">{tool.description}</p>
                
                <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border/50 items-center">
                  <Button 
                    variant={isAuthenticated ? "outline" : "ghost"} 
                    size="sm" 
                    onClick={() => isAuthenticated && onUpvote(tool._id)}
                    disabled={!isAuthenticated}
                    className={`flex items-center gap-1.5 h-8 ${isAuthenticated ? 'hover:bg-primary/10 hover:text-primary' : 'opacity-70 cursor-not-allowed'}`}
                  >
                    <ArrowUp size={16} />
                    <span>{tool.upvotes || 0}</span>
                  </Button>
                  
                  <Button 
                    variant={isAuthenticated ? "outline" : "ghost"} 
                    size="sm" 
                    onClick={() => isAuthenticated && onWant(tool._id)}
                    disabled={!isAuthenticated}
                    className={`flex items-center gap-1.5 h-8 ${isAuthenticated ? 'hover:bg-primary/10 hover:text-primary' : 'opacity-70 cursor-not-allowed'}`}
                  >
                    <Briefcase size={16} />
                    <span>{tool.wants || 0}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleComments(tool._id)}
                    className="flex items-center gap-1.5 ml-auto h-8"
                  >
                    <MessageSquare size={16} />
                    <span>{tool.comments?.length || 0}</span>
                    {expandedComments[tool._id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </Button>

                  <Button
                    variant={bookmarkedTools[tool._id] ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleBookmark(tool._id)}
                    className={`flex items-center gap-1.5 h-8 ${bookmarkedTools[tool._id] ? 'bg-primary text-primary-foreground' : ''}`}
                    disabled={!isAuthenticated}
                  >
                    <Bookmark size={16} className={bookmarkedTools[tool._id] ? "fill-current" : ""} />
                    <span>{bookmarkedTools[tool._id] ? "Bookmarked" : "Bookmark"}</span>
                  </Button>
                  
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground ml-auto">
                    <time dateTime={tool.createdAt}>
                      {new Date(tool.createdAt).toLocaleDateString()}
                    </time>
                  </div>
                </div>
                
                <AnimatePresence>
                  {expandedComments[tool._id] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ToolComments 
                        toolId={tool._id} 
                        comments={tool.comments || []} 
                        onAddComment={(text) => onAddComment(tool._id, text)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolList;
