import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ToolForm from '../components/ToolForm';
import { useAuth } from '../hooks/useAuth';
import { useToolData } from '../hooks/useToolData';
import { toast } from 'sonner';

const SubmitToolPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addTool } = useToolData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Log authentication status when the component mounts and when it changes
  useEffect(() => {
    console.log('🔐 SubmitToolPage - Authentication Status:', { 
      isAuthenticated,
      userId: user?._id,
      userName: user?.name,
      cookies: document.cookie ? 'Present' : 'None'
    });
    
    if (!isAuthenticated) {
      console.log("⚠️ User not authenticated for tool submission");
    }
  }, [isAuthenticated, user]);

  const handleSubmit = async (name: string, description: string, userId: string, authorName: string) => {
    console.log('🔄 Tool submission initiated', { 
      name, 
      descriptionLength: description.length,
      userId,
      authorName,
      isAuthenticated: isAuthenticated,
      userData: user ? {
        id: user._id,
        name: user.name,
        email: user.email
      } : null
    });

    if (!isAuthenticated || !user) {
      console.error('❌ Tool submission failed - User not authenticated');
      toast.error("You must be logged in to submit a tool");
      navigate('/login?redirect=/submit');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("📤 Submitting tool to API", { name, description });
      
      // Call addTool with the required data
      await addTool({
        name,
        description
      });
      
      console.log('✅ Tool submitted successfully');
      
      // Redirect to tools list on success
      navigate('/?created=true');
      toast.success("Tool submitted successfully!");
    } catch (error) {
      console.error("❌ Error submitting tool:", error);
      // Check if it's an authentication error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('authentication') || 
          errorMessage.includes('unauthorized') || 
          errorMessage.includes('401')) {
        console.error('❌ Authentication failure detected during submission');
        toast.error("Authentication error. Please try logging in again.");
        navigate('/login?redirect=/submit&auth_error=true');
      } else {
        toast.error("Failed to submit tool. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Submit a New Tool</h1>

      <div className="max-w-2xl mx-auto">
        <ToolForm 
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />

        {!isAuthenticated && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-600">
              Please <button 
                onClick={() => navigate('/login?redirect=/submit')} 
                className="font-medium underline"
              >
                log in
              </button> or <button 
                onClick={() => navigate('/signup?redirect=/submit')} 
                className="font-medium underline"
              >
                register
              </button> to submit a tool.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmitToolPage;
