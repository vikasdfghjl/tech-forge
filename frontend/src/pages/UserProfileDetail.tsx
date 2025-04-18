// filepath: c:\Users\shyvi\Projects\clg-project\tech-forge\frontend\src\pages\UserProfileDetail.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ToolCard from '../components/ToolCard';
import { Tool, useToolData } from '../hooks/useToolData';
import { User } from '../contexts/AuthContextType';
import apiService from '../utils/apiService';

const UserProfileDetail = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser, getUser } = useAuth();
  const { bookmarkTool, getPostedTools, getBookmarkedTools, getToolsByUser } = useToolData();
  
  const [userInfo, setUserInfo] = useState<User & { isCurrentUser?: boolean }>(null);
  const [userTools, setUserTools] = useState<Tool[]>([]);
  const [bookmarkedTools, setBookmarkedTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tools' | 'bookmarks'>('tools');
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!username) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch the user's profile information
        const userData = await getUser(username);
        setUserInfo(userData);
        
        // Fetch tools created by this user
        const tools = await getToolsByUser(userData._id || username);
        setUserTools(tools);
        
        // If viewing own profile, fetch bookmarked tools
        if (userData.isCurrentUser) {
          const bookmarks = await getBookmarkedTools();
          setBookmarkedTools(Array.isArray(bookmarks) ? bookmarks : []);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [username, getUser, getToolsByUser, getBookmarkedTools]);
  
  // Dummy handlers for tool interactions - replace with actual handlers
  const handleUpvote = async (id: string) => {
    console.log('Upvoting tool', id);
  };
  
  const handleWant = async (id: string) => {
    console.log('Wanting tool', id);
  };
  
  const handleAddComment = async (toolId: string, text: string) => {
    console.log('Adding comment to tool', toolId, text);
  };
  
  const handleBookmark = async (toolId: string) => {
    console.log('Bookmark tool', toolId);
  };
  
  const handleDelete = (id: string) => {
    console.log('Deleting tool', id);
  };
  
  const handleUpdateTool = (id: string, data: Partial<Tool>) => {
    console.log('Updating tool', id, data);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        {error}
      </div>
    );
  }
  
  if (!userInfo) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
        <p>The requested user profile could not be found.</p>
      </div>
    );
  }
  
  const displayedTools = activeTab === 'tools' 
    ? userTools 
    : bookmarkedTools;
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="bg-blue-600 p-6 text-white">
          <h1 className="text-3xl font-bold">{userInfo.username || 'User'}</h1>
          <p className="opacity-90">{userInfo.email}</p>
        </div>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <span className="text-gray-500 mr-2">Joined:</span>
            <span>{new Date(userInfo.createdAt).toLocaleDateString()}</span>
          </div>
          {userInfo.bio && (
            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-1">Bio</h3>
              <p className="text-gray-600">{userInfo.bio}</p>
            </div>
          )}
        </div>
      </div>
      
      {userInfo.isCurrentUser && (
        <div className="flex border-b mb-4">
          <button
            onClick={() => setActiveTab('tools')}
            className={`py-2 px-4 font-medium ${
              activeTab === 'tools' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            My Tools ({userTools.length})
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`py-2 px-4 font-medium ${
              activeTab === 'bookmarks' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Bookmarks ({bookmarkedTools.length})
          </button>
        </div>
      )}
      
      <div className="space-y-4">
        {displayedTools.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-xl font-medium text-gray-500 mb-2">
              {activeTab === 'tools' ? 'No tools yet' : 'No bookmarked tools'}
            </h3>
            <p className="text-gray-500">
              {activeTab === 'tools' 
                ? 'This user hasn\'t submitted any tools yet.' 
                : 'You haven\'t bookmarked any tools yet.'}
            </p>
          </div>
        ) : (
          displayedTools.map((tool, index) => (
            <ToolCard
              key={tool._id || index}
              tool={tool}
              onUpvote={handleUpvote}
              onWant={handleWant}
              onAddComment={handleAddComment}
              onBookmark={handleBookmark}
              onDelete={() => handleDelete(tool._id || '')}
              onUpdate={(data) => handleUpdateTool(tool._id || '', data)}
              index={index}
              hideAdminButtons={!userInfo.isCurrentUser}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default UserProfileDetail;