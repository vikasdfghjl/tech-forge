import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import JWT_CONFIG from '../config/jwt_config';
import { AuthRequest } from '../types/express';

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

    // Generate token using the centralized function
    const token = JWT_CONFIG.generateToken(user._id.toString());
    
    // Set cookie using configuration from JWT_CONFIG
    res.cookie(JWT_CONFIG.cookie.name, token, JWT_CONFIG.cookie.options);

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

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Email/username and password are required' });
    }

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
    
    // Generate JWT token using the centralized function
    const token = JWT_CONFIG.generateToken(user._id.toString());
    
    // Set cookie with the token using our configuration
    res.cookie(JWT_CONFIG.cookie.name, token, JWT_CONFIG.cookie.options);
    
    // Return token and user data
    return res.status(200).json({
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
    return res.status(500).json({ message: 'Server error' });
  }
};

// Logout user
export const logout = (req: Request, res: Response): void => {
  res.clearCookie(JWT_CONFIG.cookie.name);
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

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
