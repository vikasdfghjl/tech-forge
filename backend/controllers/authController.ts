import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

// Set up JWT secret from environment or use a default (for development only)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-jwt-key'; // Use environment variables in production
console.log('JWT Secret:', JWT_SECRET);
// Generate JWT token
const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: '30d' // Token expires in 30 days
  });
};

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  username?: string;
  dateOfBirth?: string;
  gender?: string;
  country?: string;
}

interface LoginRequest {
  identifier: string; // Can be email or username
  password: string;
}

// Register a new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, username, dateOfBirth, gender, country } = req.body as RegisterRequest;

    // Check if user already exists by email
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      res.status(400).json({ message: 'User already exists with this email' });
      return;
    }

    // Check if username is taken
    if (username) {
      const existingUserByUsername = await User.findOne({ username });
      if (existingUserByUsername) {
        res.status(400).json({ message: 'This username is already taken' });
        return;
      }
    }

    // Create new user
    const newUsername = username || email.split('@')[0]; // Use email prefix as username if not provided
    
    const userData: any = {
      name,
      email,
      username: newUsername,
      password
    };
    
    // Add optional fields if they exist
    if (dateOfBirth) userData.dateOfBirth = new Date(dateOfBirth);
    if (gender) userData.gender = gender;
    if (country) userData.country = country;
    
    const user = new User(userData);

    await user.save();

    // Generate token
    const token = generateToken(user._id.toString());

    // Return user data without password and the token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      country: user.country,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void | Response> => {
  try {
    const { identifier, password } = req.body as LoginRequest;

    // Find user by email or username
    const user = await User.findOne({ 
      $or: [{ email: identifier }, { username: identifier }]
    }).select('+password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if password matches
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token using the common function
    const token = generateToken(user._id.toString());
    
    // Set cookie with the token
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    
    console.log('[AUTH] Setting auth cookie for user:', user._id);
    
    // Return token and user data
    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        country: user.country
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Extended Request interface to include user property
interface AuthRequest extends Request {
  user?: IUser;
}

// Get current user profile
export const getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
};
