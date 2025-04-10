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
    
    // Setup headers with proper content type
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    // Merge our options with the provided ones, ensuring credentials are included
    const fetchOptions: RequestInit = {
      ...options,
      headers,
      credentials: 'include', // Always include cookies for authentication
    };
    
    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
    console.log('📤 Request options:', {
      method: fetchOptions.method,
      headers: fetchOptions.headers,
      credentials: fetchOptions.credentials,
      bodyLength: fetchOptions.body ? JSON.stringify(fetchOptions.body).length : 0
    });
    
    if (fetchOptions.body) {
      try {
        // Safely log request body with sensitive info masked
        const bodyObj = JSON.parse(fetchOptions.body as string);
        const sanitizedBody = { ...bodyObj };
        
        // Mask sensitive fields if they exist
        if (sanitizedBody.password) sanitizedBody.password = '******';
        if (sanitizedBody.token) sanitizedBody.token = '******';
        
        console.log('📤 Request body:', sanitizedBody);
      } catch (e) {
        console.log('📤 Request body: [Could not parse body]');
      }
    }
    
    try {
      const response = await fetch(url, fetchOptions);
      
      console.log(`📥 Response status: ${response.status} (${response.statusText})`);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Clone the response to read it twice (once for logging, once for return)
      const clonedResponse = response.clone();
      
      try {
        const responseData = await clonedResponse.json();
        console.log('📥 Response data:', responseData);
      } catch (e) {
        console.log('📥 Response data: [Not valid JSON]');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Error: ${response.status}`;
        
        if (response.status === 401) {
          // Handle unauthorized specifically
          console.error('❌ Authentication error:', errorMessage);
          console.error('❌ Cookie status:', document.cookie ? 'Cookies present' : 'No cookies found');
        }
        
        throw new Error(errorMessage);
      }
      
      // Return successful response
      return await response.json();
    } catch (error) {
      console.error(`❌ API request error for ${endpoint}:`, error);
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
