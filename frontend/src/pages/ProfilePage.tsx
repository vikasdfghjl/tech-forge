import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Bookmark, Wrench, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToolData, Tool } from '../hooks/useToolData';
import { Link } from 'react-router-dom';
import { toast } from 'sonner'; // Import toast for feedback

const ProfilePage = () => {
  const { user } = useAuth();
  const { getBookmarkedTools, getPostedTools, deleteTool } = useToolData();
  const [bookmarkedTools, setBookmarkedTools] = useState<Tool[]>([]);
  const [postedTools, setPostedTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const dataFetchedRef = useRef(false);
  
  // Use useEffect directly without useCallback to fetch data only once
  useEffect(() => {
    // Only fetch data if it hasn't been fetched yet and user exists
    if (!dataFetchedRef.current && user) {
      const fetchUserData = async () => {
        setIsLoading(true);
        try {
          // Fetch bookmarked tools
          const bookmarked = await getBookmarkedTools();
          setBookmarkedTools(bookmarked);
          
          // Fetch tools posted by the user
          const posted = await getPostedTools();
          console.log("Fetched posted tools:", posted); // Debug log
          setPostedTools(posted);
          
          // Mark data as fetched
          dataFetchedRef.current = true;
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast.error("Failed to load your profile data");
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchUserData();
    }
  }, [user, getBookmarkedTools, getPostedTools]);
  
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
  
  if (!user) {
    return <div className="flex justify-center items-center h-[50vh]">Loading profile...</div>;
  }
  
  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 pb-12">
      <h1 className="text-3xl font-bold mb-8 text-center subtle-text-gradient">
        Your Profile
      </h1>
      
      <motion.div
        className="glass-card rounded-xl overflow-hidden mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="px-6 py-4 border-b border-border/50">
          <h2 className="text-2xl font-semibold text-foreground">Account Information</h2>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
              <User size={48} className="text-primary" />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{user.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
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
            <div className="divide-y divide-border/30">
              {bookmarkedTools.map((tool) => (
                <div key={tool._id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium">{tool.name}</h3>
                    </div>
                    <Link to={`/tools/${tool._id}`} className="text-primary hover:text-primary/80 transition-colors">
                      <ExternalLink size={18} />
                    </Link>
                  </div>
                  <p className="mt-1 text-sm">{tool.description}</p>
                </div>
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
          <h2 className="text-2xl font-semibold text-foreground">Your Posted Tools</h2>
        </div>

        <div className="p-6">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading your tools...</p>
          ) : postedTools.length > 0 ? (
            <div className="divide-y divide-border/30">
              {postedTools.map((tool) => (
                <div key={tool._id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium">{tool.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Posted on {new Date(tool.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Link to={`/tools/${tool._id}/edit`} className="text-blue-500 hover:text-blue-400 transition-colors">
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDeleteTool(tool._id)}
                        className="text-red-500 hover:text-red-400 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
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
