import { Tool } from "../hooks/useToolData";
import axios from 'axios';

// Use a consistent approach for API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Define interfaces for proper typing
interface ApiErrorResponse {
  data?: {
    message?: string;
    [key: string]: unknown;
  };
}

interface ApiErrorObject extends Error {
  response?: ApiErrorResponse;
  request?: unknown;
  isAxiosError?: boolean;
}

// Type guard function with type predicate
function isApiError(error: unknown): error is ApiErrorObject {
  return Boolean(
    error && 
    typeof error === 'object' && 
    'isAxiosError' in error && 
    error.isAxiosError === true
  );
}

// Add response type definitions for better type safety
interface UpvoteResponse {
  success: boolean;
  upvotes: number;
  userUpvoted: boolean;
  message?: string;
}

interface WantResponse {
  success: boolean;
  wants: number;
  userWanted: boolean;
  message?: string;
}

interface BookmarkResponse {
  success: boolean;
  bookmarked: boolean;
  message: string;
}

interface CommentResponse {
  id: string;
  text: string;
  author: string | { _id: string; name: string; username: string };
  timestamp: number;
  _id?: string;
}

// Default fetch options with credentials
const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include' as RequestCredentials,
};

// Helper function for fetch requests
async function fetchApi<T = unknown>(endpoint: string, options = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    console.log(`Making API request to: ${url}`, options);
    
    const response = await fetch(url, { 
      ...defaultOptions, 
      ...options,
      credentials: 'include' // Ensure this is always included
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: response.statusText,
      }));
      
      console.error(`API error (${response.status}):`, errorData);
      
      // Special handling for unauthorized errors
      if (response.status === 401) {
        console.warn("Authentication error. You might need to log in again.");
        // Could dispatch an authentication event here
        window.dispatchEvent(new CustomEvent('auth:required'));
      }
      
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    
    return response.json() as Promise<T>;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}

// Fetch all tools
export const fetchTools = async () => {
  return fetchApi('/api/tools');
};

// Define a type for the tool creation payload
interface CreateToolPayload {
  name: string;
  description: string;
  category?: string;
  website?: string;
  logo?: string;
  tags?: string[];
}

// Create a new tool
export const createTool = async (toolData: CreateToolPayload) => {
  return fetchApi('/api/tools', {
    method: 'POST',
    body: JSON.stringify(toolData),
  });
};

// Define interface for the posted tools response
interface PostedToolsResponse {
  tools: Tool[];
}

// Define interface for the bookmarked tools response
interface BookmarkedToolsResponse {
  bookmarkedTools: Tool[];
}

// Get tools created by the current user
// Get tools bookmarked by the current user
export const getBookmarkedTools = async () => {
  const response = await fetchApi<BookmarkedToolsResponse>('/api/interactions/bookmarks');
  return response.bookmarkedTools || [];
};

// Upvote a tool with proper typing
export const upvoteTool = async (toolId: string): Promise<UpvoteResponse> => {
  console.log(`Sending upvote request for tool ${toolId}`);
  return fetchApi<UpvoteResponse>(`/api/interactions/upvote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      itemId: toolId
    }),
  });
};

// Want a tool with proper typing
export const wantTool = async (toolId: string): Promise<WantResponse> => {
  console.log(`Sending want request for tool ${toolId}`);
  return fetchApi<WantResponse>(`/api/interactions/want`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      itemId: toolId
    }),
  });
};

// Delete a tool
export const deleteTool = async (toolId: string): Promise<{ success: boolean; message: string }> => {
  return fetchApi(`/api/tools/${toolId}`, {
    method: 'DELETE',
  });
};

// Add a comment to a tool with proper typing
export const addComment = async (toolId: string, text: string): Promise<CommentResponse> => {
  return fetchApi<CommentResponse>(`/api/tools/${toolId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
};

// Bookmark a tool with proper typing
export const bookmarkTool = async (toolId: string): Promise<BookmarkResponse> => {
  return fetchApi<BookmarkResponse>(`/api/interactions/bookmark/${toolId}`, {
    method: 'POST',
  });
};

// Define user interface
interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
}

// Add utility function for checking if user is authenticated
export const checkAuthStatus = async (): Promise<{ isAuthenticated: boolean; user?: User }> => {
  try {
    const response = await fetchApi<{ isAuthenticated: boolean; user?: User }>('/api/auth/status');
    return response;
  } catch (error) {
    return { isAuthenticated: false };
  }
};

// Improve error handling
function handleApiError(error: unknown): never {
  if (isApiError(error)) {
    // Now TypeScript knows the shape of the error object
    const responseData = error.response?.data;
    const errorMessage = responseData?.message || 'An error occurred with the API request';
    
    if (error.response) {
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error('No response received from server');
    } else {
      throw new Error(`Request error: ${error.message}`);
    }
  }
  
  // Handle non-axios errors
  throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
}

