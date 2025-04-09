/**
 * This file helps debug authentication issues
 * Run with: node debug/debug-auth-check.js
 */

// Use async IIFE to support top-level await
(async () => {
  // Use dynamic import for node-fetch
  const { default: fetch } = await import('node-fetch');
  const readline = require('readline');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  async function checkAuth() {
    try {
      console.log('=== AUTH CHECK TOOL ===');
      
      rl.question('Enter username or email: ', async (identifier) => {
        rl.question('Enter password: ', async (password) => {
          console.log('Attempting login...');
          
          try {
            // 1. Login request
            const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ identifier, password }),
            });
            
            const loginData = await loginResponse.json();
            
            console.log('\nLogin response status:', loginResponse.status);
            console.log('Login response data:', {
              ...loginData,
              token: loginData.token ? `${loginData.token.substring(0, 15)}...` : undefined,
              user: loginData.user ? { ...loginData.user, _id: loginData.user._id } : undefined
            });
            
            if (!loginResponse.ok) {
              console.error('Login failed');
              rl.close();
              return;
            }
            
            const token = loginData.token;
            if (!token) {
              console.error('No token received in response');
              rl.close();
              return;
            }
            
            // 2. Test authentication with the token
            console.log('\nTesting authentication with token...');
            
            const meResponse = await fetch('http://localhost:5000/api/auth/me', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            const meData = await meResponse.json();
            
            console.log('Profile response status:', meResponse.status);
            console.log('Profile response data:', meData);
            
            if (meResponse.ok) {
              console.log('\n✅ Authentication working correctly with token');
            } else {
              console.error('\n❌ Authentication failed with token');
            }
            
          } catch (error) {
            console.error('\nError during authentication test:', error);
          } finally {
            rl.close();
          }
        });
      });
    } catch (error) {
      console.error('Error:', error);
      rl.close();
    }
  }

  checkAuth();
})();