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

export async function fetchTools(): Promise<Tool[]> {
  const response = await fetch(`${API_URL}/tools`, {
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch tools');
  }
  
  return response.json();
}

export async function createTool(toolData: { name: string; description: string }): Promise<Tool> {
  const response = await fetch(`${API_URL}/tools`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(toolData)
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create tool');
  }
  
  return response.json();
}

export async function upvoteTool(id: string): Promise<{ upvotes: number; userUpvoted: boolean }> {
  // Get token from localStorage
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/tools/${id}/upvote`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
    credentials: 'include'
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to upvote tool');
  }
  
  return response.json();
}

export async function wantTool(id: string): Promise<{ wants: number; userWanted: boolean }> {
  // Get token from localStorage
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/tools/${id}/want`, {
    method: 'PUT', // Changed from 'POST' to 'PUT' to match backend route
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
    credentials: 'include'
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to mark tool as wanted');
  }
  
  return response.json();
}

export async function deleteTool(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/tools/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete tool');
  }
}

// Update the Comment interface to match both frontend and backend expectations
interface Comment {
  id?: string;
  _id?: string;
  text: string;
  author?: string;
  createdAt?: string;
  timestamp?: number;
}

export async function addComment(toolId: string, text: string): Promise<Comment> {
  console.log(`Adding comment to tool ${toolId}: "${text}"`);
  
  try {
    const response = await fetch(`${API_URL}/tools/${toolId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ text })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      throw new Error(errorData.message || `Failed to add comment (Status: ${response.status})`);
    }
    
    const commentData = await response.json();
    console.log('Comment added successfully:', commentData);
    
    // Ensure the response has the fields expected by the frontend
    return {
      ...commentData,
      id: commentData.id || commentData._id,  // Handle both id formats
      timestamp: commentData.timestamp || new Date(commentData.createdAt).getTime() // Add timestamp if missing
    };
  } catch (error) {
    console.error('Error in addComment API call:', error);
    throw error;
  }
}

// Add these two methods for bookmark functionality
export async function bookmarkTool(toolId: string) {
  try {
    const response = await axios.post(
      `${API_URL}/interactions/bookmark/${toolId}`,
      {},
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

interface BookmarkResponse {
  bookmarkedTools: Tool[];
}

export async function getBookmarkedTools() {
  try {
    const response = await axios.get<BookmarkResponse>(
      `${API_URL}/interactions/bookmarks`,
      { withCredentials: true }
    );
    return response.data.bookmarkedTools;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

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

