import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import JWT_CONFIG from '../config/jwt_config';
import { AuthRequest } from '../types/express';

// JWT payload interface
interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
  [key: string]: any;
}

// Authentication middleware - protects routes
export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    // Check token in both Authorization header and cookies
    const authHeader = req.headers.authorization;
    const headerToken = authHeader && authHeader.startsWith('Bearer') 
      ? authHeader.split(' ')[1] 
      : null;
      
    // Check for the token in cookies using our configured cookie name
    const cookieToken = req.cookies?.[JWT_CONFIG.cookie.name];
    
    // Use any available token
    const token = headerToken || cookieToken;
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify token using our centralized JWT secret
    const decoded = jwt.verify(token, JWT_CONFIG.secret) as DecodedToken;
    
    // Attach user to request
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    req.isAuthenticated = true;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

// Admin authorization middleware
export const admin = (req: AuthRequest, res: Response, next: NextFunction): void | Response => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Not authorized as admin' });
  }
};

// Optional auth middleware - allows guest access but attaches user if authenticated
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  const headerToken = authHeader && authHeader.startsWith('Bearer') 
    ? authHeader.split(' ')[1] 
    : null;
    
  // Check for the token in cookies using our configured cookie name
  const cookieToken = req.cookies?.[JWT_CONFIG.cookie.name];
  
  // Use any available token
  const token = headerToken || cookieToken;

  if (!token) {
    next();
    return;
  }

  try {
    // Verify token using our centralized JWT secret
    const decoded = jwt.verify(token, JWT_CONFIG.secret) as DecodedToken;
    
    // Attach user to request
    const user = await User.findById(decoded.id).select('-password');
    req.user = user || undefined;
    req.isAuthenticated = !!user;
    next();
  } catch (error) {
    // Continue as guest if token is invalid
    next();
  }
};
