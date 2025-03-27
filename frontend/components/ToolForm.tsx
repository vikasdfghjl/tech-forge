import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Adjust import path as needed

interface ToolFormProps {
  onSuccess?: () => void;
}

const ToolForm: React.FC<ToolFormProps> = ({ onSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Other',
    website: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    console.log('[DEBUG TOOL FORM] Token from localStorage:', token);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('[DEBUG TOOL FORM] Authorization header set:', headers['Authorization']);
    } else {
      console.log('[DEBUG TOOL FORM] No token found in localStorage');
    }

    try {
      console.log('[DEBUG TOOL FORM] Submitting tool with data:', formData);
      const response = await fetch('/api/tools', {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[DEBUG TOOL FORM] Server error response:', errorData);
        throw new Error(errorData.message || 'Failed to create tool');
      }

      const data = await response.json();
      console.log('[DEBUG TOOL FORM] Tool created successfully:', data);
    } catch (error) {
      console.error('[DEBUG TOOL FORM] Error creating tool:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">You must be logged in to submit a new tool.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Submit a New Tool</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
            Tool Name*
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
            Description*
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="category" className="block text-gray-700 font-medium mb-2">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="DevOps">DevOps</option>
            <option value="Design">Design</option>
            <option value="Productivity">Productivity</option>
            <option value="Mobile">Mobile</option>
            <option value="Testing">Testing</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label htmlFor="website" className="block text-gray-700 font-medium mb-2">
            Website URL
          </label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="tags" className="block text-gray-700 font-medium mb-2">
            Tags (comma separated)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="react, typescript, ui"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Submitting...' : 'Submit Tool'}
        </button>
      </form>
    </div>
  );
};

export default ToolForm;
