import Header from "@/components/Header";
import ToolList from "@/components/ToolList";
import SideColumn from "@/components/SideColumn";
import { useToolData } from "../hooks/useToolData";

// Remove the props interface as we no longer need these props
// The isDarkMode and toggleTheme are now only used in the Navbar component

const Index = () => {
  const { tools, upvoteTool, wantTool, addComment, addTool, deleteTool } = useToolData();

  // Create a wrapper function to convert the string parameters to a NewTool object
  const handleAddTool = async (name: string, description: string) => {
    await addTool({ name, description });
  };

  return (
    <div className="min-h-screen bg-background">
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
            onAddTool={handleAddTool}
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
