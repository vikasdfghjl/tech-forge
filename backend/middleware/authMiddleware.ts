/**
 * This file has been deprecated in favor of auth.ts
 * All authentication middleware functions have been consolidated into auth.ts
 * 
 * This file is kept for reference only and should not be used in new code.
 */

/*
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

// Set up JWT secret from environment or use a default
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-jwt-key'; // Use environment variables in production

// Extended Request interface to include user property
interface AuthRequest extends Request {
  user?: IUser;
  isAuthenticated?: boolean;
}

// JWT payload interface
interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void | Response> => {
  let token: string | undefined;

  console.log('[DEBUG PROTECT] Checking for token in headers and cookies...');
  console.log('[DEBUG PROTECT] Authorization Header:', req.headers.authorization);
  console.log('[DEBUG PROTECT] Cookies:', req.cookies);

  // Extract token from Authorization header or cookies
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('[DEBUG PROTECT] Token found in Authorization header:', token);
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
    console.log('[DEBUG PROTECT] Token found in cookies:', token);
  }

  if (!token) {
    console.log('[DEBUG PROTECT] No token found');
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    // Verify token
    console.log('[DEBUG PROTECT] Verifying token...');
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    console.log('[DEBUG PROTECT] Token verified. Decoded payload:', decoded);

    // Fetch user from database
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      console.log('[DEBUG PROTECT] User not found in database');
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    console.log('[DEBUG PROTECT] User authenticated:', user._id);
    next();
  } catch (error) {
    console.error('[DEBUG PROTECT] Token verification failed:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const admin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

// New middleware to check authentication without blocking
export const checkAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Add more verbose logging
    console.log('Checking authentication');
    console.log('Cookies:', req.cookies);
    console.log('Headers:', req.headers);
    
    // Check for token in cookies
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      console.log('No authentication token found');
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallbacksecret') as any;
    console.log('Decoded token:', decoded);
    
    // Find the user
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Set user and isAuthenticated flag on the request
    req.user = user;
    req.isAuthenticated = true;
    console.log('User authenticated:', user._id);
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

// Interface for decoded JWT token
interface DecodedToken {
    id: string;
    iat: number;
    exp: number;
    [key: string]: any;
}

export const authenticateUser = async (
    req: AuthRequest, 
    res: Response, 
    next: NextFunction
): Promise<void | Response> => {
    console.log('Auth middleware running, cookies:', req.cookies);
    
    // Check if token exists
    const token: string | undefined = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        console.log('No token found');
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        // Verify token
        const decoded: DecodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
        
        // Fetch the user from the database using the ID in the token
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            console.log('User not found');
            return res.status(401).json({ message: 'User not found' });
        }
        
        req.user = user;
        console.log('User authenticated:', user._id);
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(401).json({ message: 'Authentication failed' });
    }
};
*/
