import React from 'react';
import { useRouter } from 'next/router';
import ToolForm from '../components/ToolForm';
import { useAuth } from '../context/AuthContext';

const SubmitToolPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const handleSuccess = () => {
    // Redirect to tools list or show a success message
    router.push('/tools?created=true');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Submit a New Tool</h1>

      <div className="max-w-2xl mx-auto">
        <ToolForm onSuccess={handleSuccess} />

        {!isAuthenticated && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-600">
              Please <button 
                onClick={() => router.push('/login?redirect=/submit')} 
                className="font-medium underline"
              >
                log in
              </button> or <button 
                onClick={() => router.push('/register?redirect=/submit')} 
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
