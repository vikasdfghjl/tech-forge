import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { CookieOptions } from 'express';
import jwt from 'jsonwebtoken';

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '../.env');
const envExists = fs.existsSync(envPath);

// Load environment variables
if (envExists) {
  console.log(`Loading environment variables from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.warn(`Warning: .env file not found at ${envPath}`);
  dotenv.config(); // Try to load from default locations
}

// JWT Configuration
const JWT_CONFIG = {
  // Use environment variable with fallback secret
  secret: process.env.JWT_SECRET || 'tech-forge-development-secret',
  
  // Token expiration time
  expiresIn: '30d',
  
  // Cookie options
  cookie: {
    name: 'token',  // Consistent cookie name
    options: {
      httpOnly: true,
      // When sameSite is 'none', secure must be true even in development
      secure: process.env.NODE_ENV === 'production' || (process.env.NODE_ENV !== 'production' && true),
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
      sameSite: (process.env.NODE_ENV === 'production' ? 'lax' : 'none') as 'lax' | 'none' | 'strict'
    } as CookieOptions
  },
  
  // Generate JWT token using the centralized configuration
  generateToken: (userId: string): string => {
    const signOptions: jwt.SignOptions = { 
      expiresIn: (process.env.JWT_EXPIRE || JWT_CONFIG.expiresIn) as jwt.SignOptions['expiresIn']
    };
    return jwt.sign(
      { id: userId }, 
      process.env.JWT_SECRET || 'tech-forge-development-secret', 
      signOptions
    );
  }
};

// Log that JWT configuration is loaded (but don't print the secret)
console.log('JWT configuration loaded:', {
  secretLoaded: !!process.env.JWT_SECRET,
  expiresIn: JWT_CONFIG.expiresIn,
  cookieName: JWT_CONFIG.cookie.name
});

export default JWT_CONFIG;