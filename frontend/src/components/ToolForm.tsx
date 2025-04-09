import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type ToolFormProps = {
  onSubmit: (name: string, description: string, userId: string, authorName: string) => void;
  isSubmitting: boolean;
  onCancel?: () => void; 
};

const ToolForm = ({ onSubmit, isSubmitting, onCancel }: ToolFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && description.trim() && user) {
      await onSubmit(name, description, user._id, user.name);
      setName("");
      setDescription("");
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      setName("");
      setDescription("");
      onCancel();
    }
  };

  return (
    <motion.div
      className="w-full glass-card rounded-xl overflow-hidden mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div 
        className="px-6 py-4 border-b border-border/50 flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-xl font-semibold">Submit a Tool Idea</h2>
        <Button variant="ghost" size="sm" className="p-1">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </Button>
      </div>
      
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: "hidden" }}
          >
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Tool Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter a clear, descriptive name"
                  className="w-full"
                  required
                  disabled={isSubmitting || !isAuthenticated}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what problem this tool would solve and how it works"
                  className="w-full min-h-[120px] resize-y"
                  required
                  disabled={isSubmitting || !isAuthenticated}
                />
              </div>
              
              <div className="flex gap-2 pt-2">
                {onCancel && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancel}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                )}
                <Button 
                  type="submit" 
                  className="flex-1 gap-1.5"
                  disabled={isSubmitting || !isAuthenticated || !name.trim() || !description.trim()}
                >
                  {isSubmitting ? "Submitting..." : "Submit Idea"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              
              {!isAuthenticated && (
                <div className="p-3 text-sm bg-muted/50 text-muted-foreground rounded-lg text-center">
                  You need to be logged in to submit a tool idea
                </div>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ToolForm;
