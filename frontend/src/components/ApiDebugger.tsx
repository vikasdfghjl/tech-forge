import { useState } from 'react';
import { Button } from './ui/button';
import { toast } from 'sonner';

const ApiDebugger = () => {
  const [apiStatus, setApiStatus] = useState<string>('Not tested');
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const testApiConnection = async () => {
    setIsLoading(true);
    setApiStatus('Testing...');

    try {
      const response = await fetch(`${API_URL}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          setApiStatus(`Connected: ${JSON.stringify(data)}`);
          toast.success('API connection successful!');
        } else {
          const text = await response.text();
          setApiStatus(`Connected but received non-JSON: ${text.substring(0, 50)}...`);
          toast.warning('API connected but returned non-JSON response');
        }
      } else {
        setApiStatus(`Failed: ${response.status} ${response.statusText}`);
        toast.error(`API connection failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('API connection test error:', error);
      setApiStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error(`API connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testAuthEndpoint = async () => {
    setIsLoading(true);
    setApiStatus('Testing auth endpoint...');

    try {
      const response = await fetch(`${API_URL}/api/auth/test`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setApiStatus(`Auth endpoint accessible: ${JSON.stringify(data)}`);
        toast.success('Auth API connection successful!');
      } else {
        setApiStatus(`Auth endpoint failed: ${response.status} ${response.statusText}`);
        toast.error(`Auth API connection failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Auth endpoint test error:', error);
      setApiStatus(`Auth error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error(`Auth API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white/50">
      <h3 className="text-lg font-medium mb-2">API Connection Debugger</h3>
      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-1">API URL:</p>
        <code className="bg-gray-100 p-1 rounded text-xs">{API_URL}</code>
      </div>
      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-1">Status:</p>
        <div className="bg-gray-100 p-2 rounded text-xs break-all">
          {apiStatus}
        </div>
      </div>
      <div className="flex space-x-2">
        <Button 
          onClick={testApiConnection} 
          disabled={isLoading}
          className="w-1/2"
        >
          {isLoading ? 'Testing...' : 'Test Health API'}
        </Button>
        <Button 
          onClick={testAuthEndpoint} 
          disabled={isLoading}
          className="w-1/2"
        >
          {isLoading ? 'Testing...' : 'Test Auth API'}
        </Button>
      </div>
    </div>
  );
};

export default ApiDebugger;
