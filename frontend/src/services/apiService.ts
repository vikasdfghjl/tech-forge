import { Tool } from "../hooks/useToolData";
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Default fetch options with credentials
const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include' as RequestCredentials,
};

// Helper function for fetch requests
async function fetchApi(endpoint: string, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: response.statusText,
    }));
    throw new Error(error.message || 'Something went wrong');
  }
  
  return response.json();
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

// Get tools created by the current user
export const getPostedTools = async () => {
  const response = await fetchApi('/api/tools/user/me');
  return response.tools || [];
};

// Get tools bookmarked by the current user
export const getBookmarkedTools = async () => {
  const response = await fetchApi('/api/interactions/bookmarks');
  return response.bookmarkedTools || [];
};

// Upvote a tool
export const upvoteTool = async (toolId: string) => {
  return fetchApi(`/api/tools/${toolId}/upvote`, {
    method: 'POST',
  });
};

// Want a tool
export const wantTool = async (toolId: string) => {
  return fetchApi(`/api/tools/${toolId}/want`, {
    method: 'POST',
  });
};

// Delete a tool
export const deleteTool = async (toolId: string) => {
  return fetchApi(`/api/tools/${toolId}`, {
    method: 'DELETE',
  });
};

// Add a comment to a tool
export const addComment = async (toolId: string, text: string) => {
  return fetchApi(`/api/tools/${toolId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
};

// Bookmark a tool
export const bookmarkTool = async (toolId: string) => {
  return fetchApi(`/api/interactions/bookmark/${toolId}`, {
    method: 'POST',
  });
};

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

