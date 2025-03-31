import { Request, Response } from 'express';
import User from '../models/User';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Define AuthRequest interface for authentication
interface AuthRequest extends Request {
  user?: any;
}

// Helper function to generate JWT
const generateToken = (id: string) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_dev';
  return jwt.sign({ id }, JWT_SECRET as Secret, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  } as SignOptions);
};

// Register a new user
export const registerUser = async (req: Request, res: Response) => {
  try {
    console.log('Register request received:', req.body);
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log(`User with email ${email} already exists`);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password, // Password will be hashed in the User model pre-save hook
      role: 'user' // Default role
    });

    if (user) {
      // Generate JWT
      const token = generateToken(user._id);
      
      // Set HTTP-only cookie
      res.cookie('authToken', token, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });

      console.log('User registered successfully:', {
        id: user._id,
        name: user.name,
        email: user.email
      });

      // Return user data and token
      res.status(201).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      });
    } else {
      console.log('Invalid user data');
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Error in registerUser:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login user
export const loginUser = async (req: Request, res: Response) => {
  try {
    console.log('Login request received:', { ...req.body, password: '[REDACTED]' });
    
    if (!req.body.email || !req.body.password) {
      console.log('Missing email or password in request');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const { email, password } = req.body;

    // Find user by email
    console.log(`Looking up user with email: ${email}`);
    const user = await User.findOne({ email }).select('+password'); // Explicitly select password field

    if (!user) {
      console.log(`User with email ${email} not found`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log(`User found: ${user._id}, checking password...`);
    
    // Debug: check if password exists in the user document
    if (!user.password) {
      console.log('User record does not contain a password hash');
      return res.status(500).json({ message: 'Authentication system error' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`Password match result: ${isMatch}`);
    
    if (!isMatch) {
      console.log('Password does not match');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = generateToken(user._id);
    
    // Set HTTP-only cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    console.log('User logged in successfully:', {
      id: user._id,
      name: user.name,
      email: user.email
    });

    // Return user data and token
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Error in loginUser:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Logout user
export const logoutUser = (_req: Request, res: Response) => {
  // Clear the auth cookie
  res.clearCookie('authToken');
  res.json({ message: 'Logged out successfully' });
};

// Get user profile
export const getUserProfile = (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role
  });
};

// Update user profile
export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    });
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
};
