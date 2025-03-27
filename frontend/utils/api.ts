import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true // This ensures cookies are sent with requests
});

// Add request interceptor to include token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('[DEBUG API] Token from localStorage:', token);

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('[DEBUG API] Authorization header set:', config.headers['Authorization']);
    } else {
      console.log('[DEBUG API] No token found in localStorage');
    }

    return config;
  },
  (error) => {
    console.error('[DEBUG API] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Auth functions
export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    
    // Save token to localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Make API call to invalidate server-side session if needed
  return api.post('/auth/logout');
};

// Tool interaction functions
export const toggleUpvote = async (toolId: string) => {
  try {
    // Include token in request body as well for additional security
    const token = localStorage.getItem('token');
    const response = await api.put(`/tools/${toolId}/upvote`, { token });
    return response.data;
  } catch (error) {
    console.error('Upvote error:', error);
    throw error;
  }
};

export const toggleWant = async (toolId: string) => {
  try {
    const response = await api.put(`/tools/${toolId}/want`);
    return response.data;
  } catch (error) {
    console.error('Want error:', error);
    throw error;
  }
};

// Export the API instance as well
export default api;
