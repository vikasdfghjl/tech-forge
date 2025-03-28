import { motion } from "framer-motion";
import { ThumbsUp, Star, Clock } from "lucide-react";
import { Tool } from "../hooks/useToolData";
import ToolComments from "./ToolComments";
import { toast } from "react-toastify";

type ToolCardProps = {
  tool: Tool & { id?: string; _id?: string };
  onUpvote: (id: string) => void;
  onWant: (id: string) => void;
  onAddComment: (toolId: string, text: string) => void;
  onDelete: () => void;
  onUpdate: (updatedData: Partial<Tool>) => void;
  index: number;
};

const ToolCard = ({ tool, onUpvote, onWant, onAddComment, onDelete, onUpdate, index }: ToolCardProps) => {
  console.log("Tool object:", tool); // Debug log to inspect the tool object
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
    return 'Just now';
  };

  // Make sure the upvote handler is passing the correct ID
  const handleUpvote = () => {
    const toolId = tool._id || tool.id;
    if (!toolId) {
      console.error("Tool ID is missing!");
      toast.error("Cannot upvote: Tool ID is missing");
      return;
    }
    console.log("Upvoting tool with ID:", toolId);
    onUpvote(toolId);
  };

  // Also update the want handler
  const handleWant = () => {
    const toolId = tool._id || tool.id;
    if (!toolId) {
      console.error("Tool ID is missing!");
      toast.error("Cannot mark as wanted: Tool ID is missing");
      return;
    }
    onWant(toolId);
  };

  return (
    <motion.div
      className="tool-card w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 * index }}
      layout
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg">{tool.name}</h3>
        <button
          onClick={onDelete} // Call onDelete when clicked
          className="text-red-500 hover:text-red-700 transition-colors"
        >
          Delete
        </button>
        <button
          onClick={() => onUpdate({ name: "Updated Name", description: "Updated Description" })}
          className="text-blue-500 hover:text-blue-700 transition-colors"
        >
          Update
        </button>
        <div className="flex items-center text-xs text-muted-foreground mt-1">
          <Clock size={12} className="mr-1" />
          <span>{formatDate(tool.timestamp)}</span>
        </div>
      </div>
      
      <p className="text-muted-foreground mb-4 text-sm">
        {tool.description}
      </p>
      
      <div className="flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          by <span className="font-medium">{tool.creator}</span>
        </div>
        
        <div className="flex space-x-2">
          <motion.button
            className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
            onClick={handleUpvote}
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.05 }}
          >
            <ThumbsUp size={14} />
            <span className="text-sm font-medium">{tool.upvotes}</span>
          </motion.button>
          
          <motion.button
            className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 transition-colors"
            onClick={handleWant}
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.05 }}
          >
            <Star size={14} />
            <span className="text-sm font-medium">{tool.wants}</span>
          </motion.button>
        </div>
      </div>

      <ToolComments 
        comments={tool.comments || []} 
        onAddComment={(text) => {
          const toolId = tool._id || tool.id;
          if (!toolId) {
            console.error("Tool ID is missing!");
            toast.error("Cannot add comment: Tool ID is missing");
            return;
          }
          onAddComment(toolId, text);
        }} 
      />
    </motion.div>
  );
};

export default ToolCard;
