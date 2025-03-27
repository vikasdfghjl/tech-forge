import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the User type
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

// Define the AuthContext interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

// Create a provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update useEffect to check for token in localStorage too
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        // Check for token in localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          setIsLoading(false);
          return;
        }
        
        console.log('Found token in localStorage, fetching user data');
        
        // Attempt to get user profile using stored token
        const response = await fetch('/api/auth/me', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          console.log('User authenticated from stored token');
        } else {
          // Clear invalid token
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      console.log('Login successful:', data);

      // Store token in localStorage for using in API requests
      if (data.token) {
        localStorage.setItem('token', data.token);
        console.log('Token saved to localStorage');
      }

      // Make sure to set the user from the response
      setUser(data.user);
      return data;
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during login';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store token in localStorage after successful registration
      if (data.token) {
        localStorage.setItem('token', data.token);
        console.log('Token saved to localStorage after registration');
      }

      // Set user data after registration
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role
      });
      
      return data;

    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during registration';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      // Clear token from localStorage
      localStorage.removeItem('token');
    } catch (err: Error | unknown) {
      console.error('Logout error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during logout';
      setError(errorMessage);
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook for using the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
