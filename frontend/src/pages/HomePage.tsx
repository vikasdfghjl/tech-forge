import ToolList from "../components/ToolList";
import { Tool } from "../hooks/useToolData";

interface HomePageProps {
  tools: Tool[];
  onUpvote: (id: string) => Promise<void>;
  onWant: (id: string) => Promise<void>;
  onAddComment: (toolId: string, commentText: string) => Promise<void>;
  onAddTool: (name: string, description: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const HomePage = ({ 
  tools, 
  onUpvote, 
  onWant, 
  onAddComment, 
  onAddTool, 
  onDelete 
}: HomePageProps) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
      <h1 className="text-3xl font-bold mb-8 text-center subtle-text-gradient">
        Tech Forge - Vote For Developer Tools
      </h1>
      
      <ToolList 
        tools={tools} 
        onUpvote={onUpvote}
        onWant={onWant}
        onAddComment={onAddComment}
        onAddTool={onAddTool}
        onDelete={onDelete}
      />
    </div>
  );
};

export default HomePage;
