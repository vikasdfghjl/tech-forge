import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Heart, MessageSquare, Trash2 } from "lucide-react";
import { Tool } from "../hooks/useToolData";
import { useAuth } from "../contexts/AuthContext";
import ToolForm from "./ToolForm";
import ToolComments from "./ToolComments";
import { Button } from "./ui/button";

type ToolListProps = {
  tools: Tool[];
  onUpvote: (id: string) => Promise<void>;
  onWant: (id: string) => Promise<void>;
  onAddComment: (toolId: string, commentText: string) => Promise<void>;
  onAddTool: (name: string, description: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

const ToolList = ({
  tools,
  onUpvote,
  onWant,
  onAddComment,
  onAddTool,
  onDelete,
}: ToolListProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const handleToolSubmit = async (name: string, description: string) => {
    setIsSubmitting(true);
    try {
      await onAddTool(name, description);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ensure tools is always an array even if it's undefined
  const safeTools = Array.isArray(tools) ? tools : [];

  return (
    <div className="space-y-6 w-full">
      <ToolForm onSubmit={handleToolSubmit} isSubmitting={isSubmitting} />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Current Tool Ideas</h2>
        
        {safeTools.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            No tools found. Be the first to submit an idea!
          </div>
        ) : (
          <AnimatePresence>
            <div className="max-h-[400px] overflow-y-auto" style={{ 
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent'
            }}>
              {safeTools.map((tool) => (
                <motion.div
                  key={tool._id}
                  className="tool-card"
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
                  
                  <div className="flex gap-4 mt-4 pt-4 border-t border-border/50">
                    <button
                      className="flex items-center gap-1.5 hover:text-primary transition-colors"
                      onClick={() => onUpvote(tool._id)}
                      disabled={!isAuthenticated}
                    >
                      <ArrowUp size={16} />
                      <span>{tool.upvotes || 0}</span>
                    </button>
                    
                    <button
                      className="flex items-center gap-1.5 hover:text-primary transition-colors"
                      onClick={() => onWant(tool._id)}
                      disabled={!isAuthenticated}
                    >
                      <Heart size={16} />
                      <span>{tool.wants || 0}</span>
                    </button>
                    
                    <div className="flex items-center gap-1.5 ml-auto text-xs text-muted-foreground">
                      <time dateTime={tool.createdAt}>
                        {new Date(tool.createdAt).toLocaleDateString()}
                      </time>
                    </div>
                  </div>
                  
                  <ToolComments 
                    toolId={tool._id} 
                    comments={tool.comments || []} 
                    onAddComment={(text) => onAddComment(tool._id, text)}
                  />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default ToolList;
