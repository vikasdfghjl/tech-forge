import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import ToolCard from "./ToolCard";
import { Tool } from "../hooks/useToolData";

type ToolListProps = {
  onUpvote: (id: string) => void;
  onWant: (id: string) => void;
  onAddComment: (toolId: string, text: string) => void;
  onAddTool: (name: string, description: string) => void;
};

const ToolList = ({ onUpvote, onWant, onAddComment, onAddTool }: ToolListProps) => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState<string>(""); 
  const [filterType, setFilterType] = useState<string>("all"); // Add filter type (name, description, all)
  const [sort, setSort] = useState<string>(""); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTools = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("Fetching tools from API...");
        const response = await fetch("http://localhost:5000/api/tools");
        
        console.log("API response status:", response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Tools fetched successfully:", data);
        
        if (!Array.isArray(data)) {
          console.error("API did not return an array:", data);
          setError("Invalid data format received from server");
          setTools([]);
        } else {
          setTools(data);
        }
      } catch (error) {
        console.error("Failed to fetch tools:", error);
        setError("Failed to load tools. Please try again later.");
        setTools([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTools();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("http://localhost:5000/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      if (!response.ok) {
        throw new Error("Failed to create tool");
      }
      const newTool = await response.json();
      setTools((prev) => [newTool, ...prev]);
    } catch (error) {
      console.error("Error creating tool:", error);
    } finally {
      setIsSubmitting(false);
      setName("");
      setDescription("");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Extract the MongoDB ID if it's an object ID string
      const mongoId = id.includes('_id') ? id.split('_id:')[1] : id;
      
      const response = await fetch(`http://localhost:5000/api/tools/${mongoId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete tool");
      }
      setTools((prev) => prev.filter((tool) => (tool.id || tool._id) !== id));
    } catch (error) {
      console.error("Error deleting tool:", error);
    }
  };

  const handleUpdate = async (id: string, updatedData: Partial<Tool>) => {
    try {
      // Extract the MongoDB ID if it's an object ID string
      const mongoId = id.includes('_id') ? id.split('_id:')[1] : id;
      
      const response = await fetch(`http://localhost:5000/api/tools/${mongoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) {
        throw new Error("Failed to update tool");
      }
      const updatedTool = await response.json();
      // Ensure the updated tool has an id property
      updatedTool.id = updatedTool.id || updatedTool._id;
      
      setTools((prev) =>
        prev.map((tool) => ((tool.id || tool._id) === id ? updatedTool : tool))
      );
    } catch (error) {
      console.error("Error updating tool:", error);
    }
  };

  // Improved filter function to safely handle null/undefined values and filter by multiple fields
  const filteredTools = tools.filter((tool) => {
    if (!filter.trim()) return true; // No filter applied, show all tools
    
    const searchTerm = filter.toLowerCase().trim();
    const name = tool.name?.toLowerCase() || "";
    const description = tool.description?.toLowerCase() || "";
    
    switch(filterType) {
      case "name":
        return name.includes(searchTerm);
      case "description":
        return description.includes(searchTerm);
      case "all":
      default:
        return name.includes(searchTerm) || description.includes(searchTerm);
    }
  });

  const sortedTools = [...filteredTools].sort((a, b) => {
    if (sort === "upvotes") return b.upvotes - a.upvotes;
    if (sort === "wants") return b.wants - a.wants;
    return 0;
  });

  console.log("Original tools array:", tools);
  console.log("Filtered tools:", filteredTools);
  console.log("Sorted tools:", sortedTools);

  // Map MongoDB _id to id for frontend compatibility
  const toolsWithId = sortedTools.map(tool => ({
    ...tool,
    id: tool.id || tool._id // Use existing id or fallback to _id
  }));
  
  // Ensure all tools have an id property
  const safeTools = Array.isArray(toolsWithId) 
    ? toolsWithId.filter(tool => tool && typeof tool === 'object')
    : [];
    
  console.log("Safe tools for rendering:", safeTools);

  return (
    <div className="space-y-4 w-full">
      <form onSubmit={handleSubmit} className="mb-4 p-4 border rounded-lg bg-background space-y-2">
        <input
          type="text"
          placeholder="Tool Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
        <textarea
          placeholder="Tool Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded-lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Tool Idea"}
        </button>
      </form>

      {/* Enhanced Filter and Sort Controls */}
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <div className="flex flex-1 gap-2">
          <input
            type="text"
            placeholder="Search tools..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg flex-1"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">All Fields</option>
            <option value="name">Name Only</option>
            <option value="description">Description Only</option>
          </select>
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="">Sort By</option>
          <option value="upvotes">Most Upvotes</option>
          <option value="wants">Most Wants</option>
        </select>
      </div>

      {/* Show filter feedback when a filter is applied but no results */}
      {filter.trim() && safeTools.length === 0 && !isLoading && !error ? (
        <motion.div
          className="w-full glass-card rounded-xl p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          key="no-filter-results"
        >
          <p className="text-muted-foreground">
            No tools match the filter "{filter}".
            <br />
            Try a different search term or clear the filter.
          </p>
          <button 
            onClick={() => setFilter("")}
            className="mt-2 px-4 py-1 bg-primary text-white rounded-lg text-sm"
          >
            Clear Filter
          </button>
        </motion.div>
      ) : tools.length === 0 && !isLoading && !error ? (
        <motion.div
          className="w-full glass-card rounded-xl p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          key="empty-state"
        >
          <p className="text-muted-foreground">
            No tools available yet.
            <br />
            Be the first to submit a tool idea!
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <motion.div
              className="w-full glass-card rounded-xl p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              key="loading-state"
            >
              <p className="text-muted-foreground">Loading tools...</p>
            </motion.div>
          ) : error ? (
            <motion.div
              className="w-full glass-card rounded-xl p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              key="error-state"
            >
              <p className="text-muted-foreground">{error}</p>
            </motion.div>
          ) : safeTools.length === 0 ? (
            <motion.div
              className="w-full glass-card rounded-xl p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              key="empty-state"
            >
              <p className="text-muted-foreground">
                No tools match the current filters. 
                <br />
                Try a different filter or submit the first tool!
              </p>
            </motion.div>
          ) : (
            safeTools.map((tool, index) => (
              <ToolCard
                key={tool.id || tool._id}
                tool={tool}
                onUpvote={onUpvote}
                onWant={onWant}
                onAddComment={onAddComment}
                onDelete={() => handleDelete(tool.id || tool._id)}
                onUpdate={(updatedData) => handleUpdate(tool.id || tool._id, updatedData)}
                index={index}
              />
            ))
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default ToolList;
