import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  
  try {
    // Get the route from the URL
    const route = req.query.route as string[];
    const endpoint = route.join('/');
    
    const url = `${API_URL}/auth/${endpoint}`;
    console.log(`[AUTH API] Forwarding ${req.method} request to: ${url}`);
    
    // Get the token if it exists
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    
    // Forward the request to the backend API
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });
    
    // Get the response data
    const data = await response.json();
    
    // If the response includes a token in the body and was successful
    if (data.token && response.ok) {
      // Store token in a cookie with appropriate settings
      res.setHeader('Set-Cookie', `token=${data.token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${30 * 24 * 60 * 60}`);
    }
    
    // Forward the response status and data
    res.status(response.status).json(data);
  } catch (error) {
    console.error('[AUTH API] Error:', error);
    res.status(500).json({ message: 'Error connecting to backend API' });
  }
}
