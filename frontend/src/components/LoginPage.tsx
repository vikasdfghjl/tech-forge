import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ApiDebugger from './ApiDebugger';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showDebugger, setShowDebugger] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    try {
      console.log('Attempting login with:', { email, password: '********' });
      await login(email, password);
      console.log('Login successful, navigating to home page');
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      // Error is already handled by the AuthContext
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-primary text-white rounded hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <div className="mt-4 text-sm text-center">
            <button
              onClick={() => navigate('/register')}
              className="text-primary hover:underline"
            >
              Don't have an account? Register
            </button>
          </div>
        </div>

        <div className="text-center mb-4">
          <button 
            onClick={() => setShowDebugger(!showDebugger)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {showDebugger ? 'Hide' : 'Show'} API Debugger
          </button>
        </div>

        {showDebugger && <ApiDebugger />}
      </div>
    </div>
  );
};

export default LoginPage;
