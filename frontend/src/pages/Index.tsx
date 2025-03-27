import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import ToolList from "@/components/ToolList";
import SideColumn from "@/components/SideColumn";
import { useToolData } from "../hooks/useToolData";

interface IndexProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Index = ({ isDarkMode, toggleTheme }: IndexProps) => {
  const { tools, upvoteTool, wantTool, addComment, addTool, deleteTool } = useToolData();

  return (
    <div className="min-h-screen bg-background">
      <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <Header />
      <main className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 py-8">
        <div className="lg:col-span-3 order-3 lg:order-1">
          <SideColumn position="left" />
        </div>
        <div className="lg:col-span-6 order-1 lg:order-2">
          <ToolList 
            tools={tools} 
            onUpvote={upvoteTool} 
            onWant={wantTool} 
            onAddComment={addComment}
            onAddTool={(name, description) => addTool({ 
              name, 
              description, 
              timestamp: Date.now(), 
              creator: 'Anonymous' 
            })}
            onDelete={deleteTool}
          />
        </div>
        <div className="lg:col-span-3 order-2 lg:order-3">
          <SideColumn position="right" />
        </div>
      </main>
    </div>
  );
};

export default Index;
