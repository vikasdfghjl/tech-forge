/**
 * JWT token verification utility for debugging authentication
 * Run with: node debug/debug-auth.js
 */

const jwt = require('jsonwebtoken');
require('dotenv').config();

// Helper function to decode and verify a JWT token
function decodeToken(token) {
  try {
    // First just decode without verification
    const decoded = jwt.decode(token, { complete: true });
    console.log('\n==== TOKEN DECODE (WITHOUT VERIFICATION) ====');
    console.log('Header:', decoded.header);
    console.log('Payload:', decoded.payload);
    console.log('Signature exists:', !!decoded.signature);
    
    // Now try to verify
    console.log('\n==== TOKEN VERIFICATION ====');
    const JWT_SECRET = process.env.JWT_SECRET || 'tech-forge-development-secret';
    console.log('Using JWT Secret (first 4 chars):', JWT_SECRET.substring(0, 4) + '...');
    
    const verified = jwt.verify(token, JWT_SECRET);
    console.log('Verification successful!');
    console.log('Verified payload:', verified);
    
    // Check token expiration
    const currentTime = Math.floor(Date.now() / 1000);
    console.log('\n==== TOKEN EXPIRATION ====');
    console.log('Current timestamp:', currentTime);
    console.log('Token expiration:', verified.exp);
    console.log('Difference (seconds):', verified.exp - currentTime);
    console.log('Status:', currentTime < verified.exp ? 'VALID' : 'EXPIRED');
    
    return true;
  } catch (error) {
    console.error('\n==== TOKEN ERROR ====');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    console.error('Error details:', error);
    return false;
  }
}

// Example token for testing
// Replace this with your own token for testing
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZTUxYjkzZTJjNjRkOTdhYTRhOTMwYiIsImlhdCI6MTc0MzA2ODA3OSwiZXhwIjoxNzQ1NjYwMDc5fQ.RF16e9FC-eIcWt1LoVkmoVPFULcXYQTyPZjfips9Ul8';

console.log('===============================================');
console.log('RUNNING JWT TOKEN VERIFICATION DIAGNOSTICS');
console.log('===============================================');

decodeToken(token);