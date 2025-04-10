import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from "./AuthContextType";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface AuthProviderProps {
  children: ReactNode;
}

// Create the context with a default value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing auth on load
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 Checking authentication status...');
      try {
        console.log(`🌐 Fetching auth status from: ${API_URL}/auth/me`);
        const response = await fetch(`${API_URL}/auth/me`, {
          credentials: 'include'
        });
        
        console.log('📋 Auth check response status:', response.status);
        console.log('📋 Auth check response headers:', 
          Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
          const userData = await response.json();
          console.log('✅ Authentication successful, user data:', {
            id: userData._id,
            name: userData.name,
            email: userData.email
          });
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          console.log('❌ Authentication check failed with status:', response.status);
          // Try to get more details about the failure
          try {
            const errorData = await response.json();
            console.log('❌ Auth error details:', errorData);
          } catch (e) {
            console.log('❌ Could not parse error response');
          }
        }
      } catch (err) {
        console.error("❌ Auth check error:", err);
        // Don't set error here, just silently fail
      } finally {
        setIsLoading(false);
        console.log('🔍 Auth check completed, isAuthenticated:', isAuthenticated);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`🔐 Attempting login for: ${identifier}`);
      console.log(`🌐 Login request URL: ${API_URL}/auth/login`);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({ identifier, password }),
      });
      
      console.log('📋 Login response status:', response.status);
      console.log('📋 Login response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('❌ Login failed:', data);
        throw new Error(data.message || 'Login failed');
      }
      
      console.log('✅ Login successful:', {
        userId: data.user?._id,
        name: data.user?.name,
        hasToken: !!data.token
      });
      
      // Store user data in state
      setUser(data.user);
      setIsAuthenticated(true);
      
      // No need to store token in localStorage as we're using HTTP-only cookies
      
      return data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      console.error('❌ Login error details:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    name: string, 
    email: string, 
    password: string, 
    username?: string, 
    dateOfBirth?: string, 
    gender?: string, 
    country?: string
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          name, 
          email, 
          password,
          username,
          dateOfBirth,
          gender,
          country 
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }
      
      setUser(data);
      setIsAuthenticated(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
