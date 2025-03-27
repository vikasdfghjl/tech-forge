import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-jwt-key';

// Extend the Request interface to include a user property
interface AuthRequest extends Request {
  user?: IUser;
}

// Authentication middleware - protects routes
export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  console.log('[AUTH DEBUG] Headers:', JSON.stringify({
    authorization: req.headers.authorization,
    cookie: req.headers.cookie
  }));
  console.log('[AUTH DEBUG] Cookies object:', req.cookies);
  
  let token: string | undefined;

  // Check for token in headers or cookies
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    console.log('[AUTH DEBUG] Found token in Authorization header');
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    console.log('[AUTH DEBUG] Found token in cookies');
    token = req.cookies.token;
  }

  if (!token) {
    console.log('[AUTH DEBUG] No token found');
    res.status(401).json({ message: 'Not authorized, no token' });
    return;
  }

  try {
    console.log('[AUTH DEBUG] Verifying token');
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    console.log('[AUTH DEBUG] Token valid, user ID:', decoded.id);
    
    // Attach user to request
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.log('[AUTH DEBUG] User not found in database');
      res.status(401).json({ message: 'User not found' });
      return;
    }
    
    console.log('[AUTH DEBUG] User authenticated:', user._id);
    req.user = user.toObject() as IUser;
    next();
  } catch (error) {
    console.error('[AUTH DEBUG] Authentication error:', error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Optional auth middleware - allows guest access but attaches user if authenticated
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;
  
  console.log('[DEBUG OPTIONAL AUTH] Checking optional auth');

  // Check for token in headers or cookies
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    console.log('[DEBUG OPTIONAL AUTH] No token found, continuing as guest');
    next();
    return;
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    
    // Attach user to request
    const user = await User.findById(decoded.id).select('-password');
    req.user = user ? user.toObject() as IUser : undefined;
    console.log('[DEBUG OPTIONAL AUTH] User authenticated:', req.user?._id);
    next();
  } catch (error) {
    console.log('[DEBUG OPTIONAL AUTH] Invalid token, continuing as guest');
    next();
  }
};
