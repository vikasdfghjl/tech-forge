import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Bookmark, Wrench, ExternalLink } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToolData, Tool } from '../hooks/useToolData';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import ToolCard from '../components/ToolCard'; // Import ToolCard component

const ProfilePage = () => {
  const { user } = useAuth();
  const { getBookmarkedTools, getPostedTools, deleteTool, upvoteTool, wantTool, bookmarkTool, addComment } = useToolData();
  const [bookmarkedTools, setBookmarkedTools] = useState<Tool[]>([]);
  const [postedTools, setPostedTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const dataFetchedRef = useRef(false);
  const getBookmarkedToolsRef = useRef(getBookmarkedTools);
  const getPostedToolsRef = useRef(getPostedTools);
  
  // Update refs when functions change
  useEffect(() => {
    getBookmarkedToolsRef.current = getBookmarkedTools;
    getPostedToolsRef.current = getPostedTools;
  }, [getBookmarkedTools, getPostedTools]);
  
  // Use useEffect directly without useCallback to fetch data only once
  useEffect(() => {
    // Only fetch data if it hasn't been fetched yet and user exists
    if (!dataFetchedRef.current && user) {
      let isMounted = true;
      const fetchUserData = async () => {
        setIsLoading(true);
        try {
          // Fetch bookmarked tools
          const bookmarked = await getBookmarkedToolsRef.current();
          
          if (!isMounted) return;
          
          console.log("Fetched bookmarked tools (raw response):", bookmarked);
          
          // Handle different potential response formats
          let bookmarkedToolsArray: Tool[] = [];
          
          if (Array.isArray(bookmarked)) {
            bookmarkedToolsArray = bookmarked;
          } else if (bookmarked && typeof bookmarked === 'object') {
            // Check for all possible response formats
            if ('bookmarkedTools' in bookmarked && Array.isArray(bookmarked.bookmarkedTools)) {
              bookmarkedToolsArray = bookmarked.bookmarkedTools;
            } else if ('tools' in bookmarked && Array.isArray(bookmarked.tools)) {
              bookmarkedToolsArray = bookmarked.tools;
            } else if ('bookmarks' in bookmarked && Array.isArray(bookmarked.bookmarks)) {
              bookmarkedToolsArray = bookmarked.bookmarks;
            }
          }
          
          if (!isMounted) return;
          
          // Ensure each bookmarked tool has the bookmarked flag set to true
          bookmarkedToolsArray = bookmarkedToolsArray.map(tool => ({
            ...tool,
            bookmarked: true // Explicitly mark as bookmarked
          }));
          
          console.log("Processed bookmarked tools array:", bookmarkedToolsArray);
          setBookmarkedTools(bookmarkedToolsArray);
          
          // Fetch tools posted by the user
          const posted = await getPostedToolsRef.current();
          
          if (!isMounted) return;
          
          console.log("Fetched posted tools:", posted);
          
          // Check if any posted tools are also bookmarked
          const postedWithBookmarkStatus = posted.map(tool => {
            const isBookmarked = bookmarkedToolsArray.some(
              bookmarked => bookmarked._id === tool._id
            );
            return {
              ...tool,
              bookmarked: isBookmarked
            };
          });
          
          if (isMounted) {
            setPostedTools(postedWithBookmarkStatus);
            // Mark data as fetched
            dataFetchedRef.current = true;
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          if (isMounted) {
            toast.error("Failed to load your profile data");
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };
      
      fetchUserData();
      
      return () => {
        isMounted = false;
      };
    }
  }, [user]); // Only depend on user, not on the functions
  
  // Handle tool deletion
  const handleDeleteTool = async (toolId: string) => {
    try {
      await deleteTool(toolId);
      // Update the local state by removing the deleted tool
      setPostedTools(prev => prev.filter(tool => tool._id !== toolId));
      toast.success("Tool deleted successfully");
    } catch (error) {
      console.error("Error deleting tool:", error);
      toast.error("Failed to delete tool");
    }
  };

  // Handle tool upvote
  const handleUpvote = async (toolId: string) => {
    try {
      const result = await upvoteTool(toolId);
      
      // Update both bookmarked and posted tools arrays
      setBookmarkedTools(prev => 
        prev.map(tool => 
          tool._id === toolId 
            ? { ...tool, upvotes: result.upvotes }
            : tool
        )
      );
      
      setPostedTools(prev => 
        prev.map(tool => 
          tool._id === toolId 
            ? { ...tool, upvotes: result.upvotes }
            : tool
        )
      );
    } catch (error) {
      console.error("Error upvoting tool:", error);
    }
  };

  // Handle "want" action
  const handleWant = async (toolId: string) => {
    try {
      await wantTool(toolId);
      // Note: The want count would be updated in the API response,
      // but our current implementation doesn't return the new count
      // We'll just refresh the data when needed
    } catch (error) {
      console.error("Error marking tool as wanted:", error);
    }
  };

  // Handle bookmark toggle
  const handleBookmark = async (toolId: string) => {
    try {
      console.log(`Toggling bookmark for tool ${toolId}`);
      
      // Get the current bookmark state for consistency
      const isCurrentlyBookmarked = bookmarkedTools.some(tool => tool._id === toolId);
      console.log(`Current bookmark status: ${isCurrentlyBookmarked ? 'bookmarked' : 'not bookmarked'}`);
      
      // Call the API to toggle the bookmark
      const result = await bookmarkTool(toolId);
      console.log("Server response for bookmark toggle:", result);
      
      if (result.bookmarked) {
        // If tool was just bookmarked, find it in posted tools and add to bookmarked
        const toolToAdd = postedTools.find(tool => tool._id === toolId);
        if (toolToAdd && !bookmarkedTools.some(t => t._id === toolId)) {
          console.log("Adding tool to bookmarks:", toolToAdd);
          setBookmarkedTools(prev => [...prev, {...toolToAdd, bookmarked: true}]);
        } else {
          // Update existing tool in bookmarked list to ensure it's marked as bookmarked
          setBookmarkedTools(prev => 
            prev.map(tool => 
              tool._id === toolId 
                ? { ...tool, bookmarked: true }
                : tool
            )
          );
        }
      } else {
        // If tool was unbookmarked, remove from bookmarked list
        console.log("Removing tool from bookmarks");
        setBookmarkedTools(prev => prev.filter(tool => tool._id !== toolId));
      }
      
      // Update bookmarked status in posted tools
      setPostedTools(prev => 
        prev.map(tool => 
          tool._id === toolId 
            ? { ...tool, bookmarked: result.bookmarked }
            : tool
        )
      );
      
      // Show feedback to the user
      toast.success(result.bookmarked 
        ? "Tool added to bookmarks" 
        : "Tool removed from bookmarks");
        
    } catch (error) {
      console.error("Error bookmarking tool:", error);
      toast.error("Failed to update bookmark");
    }
  };

  // Handle comment addition
  const handleAddComment = async (toolId: string, text: string) => {
    try {
      const newComment = await addComment(toolId, text);
      
      // Update the comments in both arrays
      const updateToolComments = (tools: Tool[]) => 
        tools.map(tool => {
          if (tool._id === toolId) {
            const comments = [...(tool.comments || []), newComment];
            return { ...tool, comments };
          }
          return tool;
        });
        
      setBookmarkedTools(prev => updateToolComments(prev));
      setPostedTools(prev => updateToolComments(prev));
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error adding comment:", error);
      return Promise.reject(error);
    }
  };
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Not Authenticated</h2>
          <p className="text-muted-foreground">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <motion.div 
        className="glass-card rounded-xl overflow-hidden mb-8" 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="px-6 py-4 border-b border-border/50 flex items-center">
          <User size={20} className="text-primary mr-2" />
          <h2 className="text-2xl font-semibold text-foreground">User Profile</h2>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{user.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            {user.country && (
              <div>
                <p className="text-sm text-muted-foreground">Country</p>
                <p className="font-medium">{user.country}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Account Type</p>
              <p className="font-medium capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Bookmarked Tools Section */}
      <motion.div
        className="glass-card rounded-xl overflow-hidden mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="px-6 py-4 border-b border-border/50 flex items-center">
          <Bookmark size={20} className="text-primary mr-2" />
          <h2 className="text-2xl font-semibold text-foreground">Bookmarked Tools</h2>
        </div>
        
        <div className="p-6">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading bookmarks...</p>
          ) : bookmarkedTools.length > 0 ? (
            <div className="space-y-4">
              {bookmarkedTools.map((tool, index) => (
                <ToolCard
                  key={tool._id}
                  tool={{...tool, bookmarked: true}} // Ensure bookmark is set to true
                  onUpvote={handleUpvote}
                  onWant={handleWant}
                  onAddComment={handleAddComment}
                  onDelete={() => {}} // Not allowing deletion from bookmark section
                  onUpdate={() => {}} // Not allowing updates from bookmark section
                  onBookmark={handleBookmark}
                  index={index}
                  isLoading={false}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">You haven't bookmarked any tools yet.</p>
          )}
        </div>
      </motion.div>
      
      {/* Posted Tools Section */}
      <motion.div
        className="glass-card rounded-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="px-6 py-4 border-b border-border/50 flex items-center">
          <Wrench size={20} className="text-primary mr-2" />
          <h2 className="text-2xl font-semibold text-foreground">Posted Tools</h2>
        </div>
        
        <div className="p-6">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading tools...</p>
          ) : postedTools.length > 0 ? (
            <div className="space-y-4">
              {postedTools.map((tool, index) => (
                <ToolCard
                  key={tool._id}
                  tool={tool} // Tool already has correct bookmark status from our state management
                  onUpvote={handleUpvote}
                  onWant={handleWant}
                  onAddComment={handleAddComment}
                  onDelete={() => handleDeleteTool(tool._id)}
                  onUpdate={() => {}} // We can implement update functionality later
                  onBookmark={handleBookmark}
                  index={index}
                  isLoading={false}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">You haven't posted any tools yet.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
