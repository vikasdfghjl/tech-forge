// New utility file for consistent API requests with authentication

import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Utility for making authenticated API requests
 */
const apiService = {
  /**
   * Makes a fetch request with authentication headers and error handling
   */
  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_URL}${endpoint}`;
    
    // Get token from localStorage as fallback
    const token = localStorage.getItem('auth_token');
    
    // Setup headers with auth token if available
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Merge our options with the provided ones, ensuring credentials are included
    const fetchOptions: RequestInit = {
      ...options,
      headers,
      credentials: 'include', // Always include cookies
    };
    
    try {
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Error: ${response.status}`;
        
        if (response.status === 401) {
          // Handle unauthorized specifically
          console.error('Authentication error:', errorMessage);
        }
        
        throw new Error(errorMessage);
      }
      
      // Return successful response
      return await response.json();
    } catch (error) {
      console.error(`API request error for ${endpoint}:`, error);
      throw error;
    }
  },
  
  // Convenience methods for common HTTP methods
  get(endpoint: string) {
    return this.request(endpoint);
  },
  
  post(endpoint: string, data: Record<string, unknown>) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  put(endpoint: string, data: Record<string, unknown> = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  delete(endpoint: string) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  },

  // Tool-specific methods
  upvoteTool(toolId: string) {
    return this.put(`/tools/${toolId}/upvote`);
  },

  wantTool(toolId: string) {
    return this.put(`/tools/${toolId}/want`);
  },

  bookmarkTool(toolId: string) {
    return this.post(`/interactions/bookmark/${toolId}`);
  },

  getBookmarkedTools() {
    return this.get('/interactions/bookmarks');
  },

  // Add more API methods as needed
};

export default apiService;
