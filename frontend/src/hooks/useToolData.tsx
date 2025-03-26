import { useState, useEffect } from "react";
import { toast } from "sonner";

export type Comment = {
  id: string;
  text: string;
  author: string;
  timestamp: number;
};

export type Tool = {
  id: string;
  name: string;
  description: string;
  upvotes: number;
  wants: number;
  timestamp: number;
  creator: string;
  comments: Comment[];
};

export type SortOption = "newest" | "oldest" | "most-upvotes" | "most-wants";
export type FilterOption = "all" | "most-wanted" | "trending";

// Initial sample data
const initialTools: Tool[] = [
  {
    id: "1",
    name: "AI Code Reviewer",
    description: "A tool that automatically reviews your code and suggests improvements.",
    upvotes: 42,
    wants: 28,
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
    creator: "Sarah Chen",
    comments: [
      {
        id: "c1",
        text: "This would be extremely useful for teams without senior developers.",
        author: "Devon Kim",
        timestamp: Date.now() - 1000 * 60 * 60 * 10,
      }
    ]
  },
  {
    id: "2",
    name: "Design System Generator",
    description: "Generate a complete design system from a few color inputs and style preferences.",
    upvotes: 35,
    wants: 19,
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 4, // 4 days ago
    creator: "Miguel Rodriguez",
    comments: []
  },
  {
    id: "3",
    name: "3D Animation Converter",
    description: "Convert any 2D design into a 3D animation with one click.",
    upvotes: 27,
    wants: 31,
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 1, // 1 day ago
    creator: "Alex Johnson",
    comments: [
      {
        id: "c2",
        text: "I've been wanting something like this for my design workflow!",
        author: "Lisa Park",
        timestamp: Date.now() - 1000 * 60 * 60 * 5,
      },
      {
        id: "c3",
        text: "Would this work with complex illustrations?",
        author: "Mark Taylor",
        timestamp: Date.now() - 1000 * 60 * 30,
      }
    ]
  }
];

export function useToolData() {
  // Get tools from localStorage or use initial data
  const getInitialTools = () => {
    const storedTools = localStorage.getItem("tools");
    if (!storedTools) return initialTools;
    
    try {
      // Parse stored tools and ensure comments array exists
      const parsed = JSON.parse(storedTools);
      return parsed.map((tool: Tool) => ({
        ...tool,
        comments: tool.comments || []
      }));
    } catch (error) {
      console.error("Error parsing stored tools:", error);
      return initialTools;
    }
  };

  const [tools, setTools] = useState<Tool[]>(getInitialTools);
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [filterOption, setFilterOption] = useState<FilterOption>("all");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Save tools to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("tools", JSON.stringify(tools));
  }, [tools]);

  const addTool = async (name: string, description: string) => {
    try {
      const response = await fetch("http://localhost:5000/api/tool-ideas", { // Corrected port
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        throw new Error("Failed to add tool");
      }

      const newTool = await response.json();
      setTools((prev) => [newTool, ...prev]);
      toast.success("Tool idea submitted successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit tool idea.");
    }
  };

  const upvoteTool = (id: string) => {
    setTools(prev => 
      prev.map(tool => 
        tool.id === id ? { ...tool, upvotes: tool.upvotes + 1 } : tool
      )
    );
    toast.success("Upvoted!");
  };

  const wantTool = (id: string) => {
    setTools(prev => 
      prev.map(tool => 
        tool.id === id ? { ...tool, wants: tool.wants + 1 } : tool
      )
    );
    toast.success("Added to wanted tools!");
  };

  const addComment = (toolId: string, text: string, author = "You") => {
    const newComment: Comment = {
      id: Date.now().toString(),
      text,
      author,
      timestamp: Date.now()
    };

    setTools(prev => 
      prev.map(tool => 
        tool.id === toolId 
          ? { ...tool, comments: [newComment, ...(tool.comments || [])] } 
          : tool
      )
    );
    toast.success("Comment added!");
  };

  const deleteTool = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tool-ideas/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete tool");
      }

      setTools((prev) => prev.filter((tool) => tool.id !== id));
      toast.success("Tool idea deleted successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete tool idea.");
    }
  };

  const getSortedAndFilteredTools = () => {
    let filteredTools = [...tools];
    
    // Apply filters
    if (filterOption === "most-wanted") {
      filteredTools = filteredTools.filter(tool => tool.wants > 0);
    } else if (filterOption === "trending") {
      filteredTools = filteredTools.filter(tool => (tool.upvotes + tool.wants) > 10);
    }
    
    // Apply sorting
    return filteredTools.sort((a, b) => {
      switch(sortOption) {
        case "newest":
          return b.timestamp - a.timestamp;
        case "oldest":
          return a.timestamp - b.timestamp;
        case "most-upvotes":
          return b.upvotes - a.upvotes;
        case "most-wants":
          return b.wants - a.wants;
        default:
          return 0;
      }
    });
  };

  return {
    tools: getSortedAndFilteredTools(),
    addTool,
    upvoteTool,
    wantTool,
    addComment,
    deleteTool, // Add deleteTool to the return object
    sortOption,
    setSortOption,
    filterOption,
    setFilterOption,
    isSubmitting
  };
}
