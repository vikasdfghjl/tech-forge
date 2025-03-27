import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get the backend API URL from environment variables, with a fallback
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  
  try {
    // Build the URL - handling both the collection endpoint and individual items
    let url = `${API_URL}/tools`;
    if (req.query.id) {
      url += `/${req.query.id}`;
    }
    
    // Add action endpoints like upvote if specified
    if (req.query.action) {
      url += `/${req.query.action}`;
    }
    
    console.log(`[API PROXY] Forwarding ${req.method} request to: ${url}`);
    
    // Get token from cookies or authorization header or client request headers
    let token = '';
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log('[API PROXY] Found token in cookies');
    } else if (req.headers.authorization) {
      token = req.headers.authorization.replace('Bearer ', '');
      console.log('[API PROXY] Found token in authorization header');
    } else if (req.cookies && req.headers.cookie) {
      // Try to extract token from raw cookie header if cookie-parser didn't parse it
      const cookieHeader = req.headers.cookie;
      const tokenMatch = cookieHeader.match(/token=([^;]+)/);
      if (tokenMatch) {
        token = tokenMatch[1];
        console.log('[API PROXY] Extracted token from cookie header');
      }
    }
    
    // Check for token in the actual request body for debugging
    if (req.method === 'POST' && req.body && req.body._token) {
      console.log('[API PROXY] Found token in request body');
      token = req.body._token;
      // Remove the _token field from the body before forwarding
      const { _token, ...cleanBody } = req.body;
      req.body = cleanBody;
    }
    
    // Prepare headers with Authorization if token exists
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('[API PROXY] Adding Authorization header with token');
    }
    
    // Log complete request details for debugging
    console.log('[API PROXY] Request details:', {
      method: req.method,
      url,
      headers,
      hasToken: !!token,
      bodyKeys: req.method !== 'GET' ? Object.keys(req.body || {}) : []
    });
    
    // Forward the request to the backend API
    const response = await fetch(url, {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
      credentials: 'include'
    });

    // Check for error responses
    if (!response.ok) {
      console.error(`[API PROXY] Backend returned error status: ${response.status}`);
      
      try {
        const errorData = await response.json();
        console.error('[API PROXY] Error details:', errorData);
        
        // Forward the error response
        return res.status(response.status).json(errorData);
      } catch (parseError) {
        console.error('[API PROXY] Could not parse error response:', parseError);
        return res.status(response.status).json({ 
          message: `Backend error (${response.status})`,
          proxyError: 'Could not parse error details' 
        });
      }
    }

    // Get the response data
    const data = await response.json();
    
    console.log(`[API PROXY] Response status: ${response.status}`);
    
    // Forward the response status and data
    res.status(response.status).json(data);
  } catch (error) {
    console.error('[API PROXY] Error:', error);
    res.status(500).json({ 
      message: 'Error connecting to backend API',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
