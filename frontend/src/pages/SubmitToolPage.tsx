import React from 'react';
import { useNavigate } from 'react-router-dom';
import ToolForm from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

const SubmitToolPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleSuccess = () => {
    // Redirect to tools list or show a success message
    navigate('/?created=true');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Submit a New Tool</h1>

      <div className="max-w-2xl mx-auto">
        <ToolForm 
          onSubmit={(name, description) => {
            // Logic to submit new tool
            handleSuccess();
          }} 
          isSubmitting={false}
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
