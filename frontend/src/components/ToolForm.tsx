
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

type ToolFormProps = {
  onSubmit: (name: string, description: string) => void;
  isSubmitting: boolean;
};

const ToolForm = ({ onSubmit, isSubmitting }: ToolFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

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
        <h3 className="font-medium text-base">Submit a new tool idea</h3>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label 
            htmlFor="toolName" 
            className="block mb-2 text-sm font-medium text-muted-foreground"
          >
            Tool Name
          </label>
          <input
            id="toolName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What's your tool called?"
            className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:border-primary/50 outline-none transition-all duration-200"
            required
            maxLength={50}
          />
        </div>
        <div>
          <label 
            htmlFor="toolDescription" 
            className="block mb-2 text-sm font-medium text-muted-foreground"
          >
            Description
          </label>
          <textarea
            id="toolDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does your tool do? Who is it for?"
            className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:border-primary/50 outline-none transition-all duration-200 min-h-[100px] resize-y"
            required
            maxLength={200}
          />
        </div>
        <div className="flex justify-end">
          <motion.button
            type="submit"
            className="button-primary flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.02 }}
            disabled={isSubmitting || !name.trim() || !description.trim()}
          >
            <span>{isSubmitting ? "Submitting..." : "Submit Tool Idea"}</span>
            {!isSubmitting && <ArrowRight size={18} />}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default ToolForm;
