import { Request } from 'express';
import { IUser } from '../models/User';

// Extend Express Request interface to include user property
export interface AuthRequest extends Request {
  user?: IUser;
  isAuthenticated?: boolean;
}