import { Tool } from "../hooks/useToolData";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

export async function addComment(toolId: string, text: string): Promise<Comment> {
  const response = await fetch(`${API_URL}/tools/${toolId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ text })
  });
  
  if (!response.ok) {
    throw new Error('Failed to add comment');
  }
  
  return response.json();
}
