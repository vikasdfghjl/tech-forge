import Header from "@/components/Header";
import ToolList from "@/components/ToolList";
import SideColumn from "@/components/SideColumn";
import { useToolData } from "../hooks/useToolData";
import FilterSort from "@/components/FilterSort"; // Import FilterSort component
import { useState } from "react";

const Index = () => {
  const { tools, upvoteTool, wantTool, addComment, addTool, deleteTool } = useToolData();
  const [showSubmitForm, setShowSubmitForm] = useState(false); // Control visibility of submit form
  const [filterCriteria, setFilterCriteria] = useState({ sort: 'newest', category: 'all' });

  // Create a wrapper function to convert the string parameters to a NewTool object
  const handleAddTool = async (name: string, description: string) => {
    await addTool({ name, description });
    setShowSubmitForm(false); // Hide form after submission
  };

  // Create a wrapper function for upvoteTool to match the expected type
  const handleUpvote = async (toolId: string): Promise<void> => {
    await upvoteTool(toolId);
    // The return value is ignored to match the expected Promise<void> return type
  };

  // Apply filters to tools
  const filteredTools = [...tools].sort((a, b) => {
    if (filterCriteria.sort === 'upvotes') {
      return (b.upvotes || 0) - (a.upvotes || 0);
    } else if (filterCriteria.sort === 'wants') {
      return (b.wants || 0) - (a.wants || 0);
    } else {
      // Default to newest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Header onSubmitClick={() => setShowSubmitForm(true)} />
      <main className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left sidebar - only visible on desktop */}
        <div className="hidden lg:block lg:col-span-3 xl:col-span-2 sticky top-8 self-start h-fit">
          <SideColumn position="left" />
        </div>
        
        {/* Main content area */}
        <div className="col-span-1 lg:col-span-6 xl:col-span-8">
          <div className="flex flex-col gap-6">
            {/* Filter and action bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 sticky top-0 z-10 bg-background/80 backdrop-blur-sm p-3 rounded-lg border border-border/50">
              <FilterSort 
                onChange={setFilterCriteria} 
                currentFilters={filterCriteria}
              />
              <button
                className="btn-primary text-sm px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                onClick={() => setShowSubmitForm(!showSubmitForm)}
              >
                {showSubmitForm ? 'Cancel' : '+ Submit Tool Idea'}
              </button>
            </div>

            <ToolList 
              tools={filteredTools} 
              onUpvote={handleUpvote}
              onWant={wantTool}
              onAddComment={addComment}
              onAddTool={handleAddTool}
              onDelete={deleteTool}
              showSubmitForm={showSubmitForm}
              setShowSubmitForm={setShowSubmitForm}
            />
          </div>
        </div>
        
        {/* Right sidebar - only visible on desktop */}
        <div className="hidden lg:block lg:col-span-3 xl:col-span-2 sticky top-8 self-start h-fit">
          <SideColumn position="right" />
        </div>
        
        {/* Mobile-only footer navigation with key sidebar content */}
        <div className="lg:hidden col-span-1 mt-6 grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium mb-2">How It Works</h3>
            <div className="text-xs text-muted-foreground">
              Submit ideas, get upvotes, see the best rise to the top.
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Top Categories</h3>
            <div className="text-xs text-muted-foreground">
              AI & ML, Developer Tools, Productivity
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
