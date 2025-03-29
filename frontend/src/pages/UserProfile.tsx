import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToolData, Tool } from '../hooks/useToolData';
import ToolCard from '../components/ToolCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'react-toastify';

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const { getBookmarkedTools, upvoteTool, wantTool, bookmarkTool, deleteTool } = useToolData();
  const [bookmarkedTools, setBookmarkedTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarkedTools = async () => {
    if (user) {
      try {
        setLoading(true);
        const tools = await getBookmarkedTools();
        console.log("Fetched bookmarked tools:", tools);
        
        // Map all tools to have bookmarked: true
        setBookmarkedTools(
          Array.isArray(tools) 
            ? tools.map((tool: Tool) => ({
                ...tool,
                bookmarked: true // All tools in bookmarks are bookmarked by definition
              }))
            : []
        );
      } catch (error) {
        console.error('Error loading bookmarked tools:', error);
        toast.error('Failed to load bookmarked tools');
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchBookmarkedTools();
  }, [user]);

  const handleAddComment = (toolId: string, text: string) => {
    // Implementation for adding comments
    console.log('Adding comment to tool', toolId, text);
  };

  const handleBookmark = async (toolId: string) => {
    try {
      await bookmarkTool(toolId);
      toast.success('Bookmark updated');
      // Refresh the bookmarked tools list
      fetchBookmarkedTools();
    } catch (error) {
      console.error('Error bookmarking tool:', error);
      toast.error('Failed to update bookmark');
    }
  };

  if (!user) {
    return <div className="container mx-auto px-4 py-8">Please log in to view your profile</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">User Profile</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Account Information</h2>
        <div className="bg-white p-4 rounded-lg shadow">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role || 'User'}</p>
        </div>
      </div>
      
      <Tabs defaultValue="bookmarked">
        <TabsList className="mb-4">
          <TabsTrigger value="bookmarked">Bookmarked Tools</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bookmarked">
          <h2 className="text-xl font-semibold mb-4">Bookmarked Tools</h2>
          {loading ? (
            <p>Loading bookmarked tools...</p>
          ) : bookmarkedTools.length === 0 ? (
            <p>You haven't bookmarked any tools yet.</p>
          ) : (
            <div className="space-y-4">
              {bookmarkedTools.map((tool, index) => (
                <ToolCard
                  key={tool._id || index}
                  tool={tool}
                  onUpvote={upvoteTool}
                  onWant={wantTool}
                  onBookmark={handleBookmark}
                  onAddComment={handleAddComment}
                  onDelete={() => deleteTool(tool._id || '')}
                  onUpdate={(updatedData) => console.log('Update not implemented', tool._id || '', updatedData)}
                  index={index}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="activity">
          <h2 className="text-xl font-semibold mb-4">Activity</h2>
          <p>Your recent activity will appear here.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;
