import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";

type ToolFormProps = {
  onSubmit: (name: string, description: string) => void;
  isSubmitting: boolean;
};

const ToolForm = ({ onSubmit, isSubmitting }: ToolFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { isAuthenticated } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && description.trim()) {
      onSubmit(name, description);
      setName("");
      setDescription("");
    }
  };

  return (
    <motion.div
      className="w-full glass-card rounded-xl overflow-hidden mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="px-6 py-4 border-b border-border/50">
        <h2 className="text-xl font-semibold">Submit a Tool Idea</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Tool Name
          </label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter tool name"
            className="w-full"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this tool would do"
            className="w-full min-h-[120px]"
            required
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting || !isAuthenticated}
        >
          {isSubmitting ? "Submitting..." : "Submit Tool Idea"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        
        {!isAuthenticated && (
          <p className="text-sm text-muted-foreground text-center mt-2">
            You need to be logged in to submit a tool idea
          </p>
        )}
      </form>
    </motion.div>
  );
};

export default ToolForm;
