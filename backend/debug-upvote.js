/**
 * This file helps debug upvote functionality issues
 * Run with: node debug-upvote.js
 */

// Use async IIFE to support top-level await
(async () => {
  // Use dynamic imports for ESM modules
  const { default: fetch } = await import('node-fetch');
  const readline = await import('readline');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  async function checkUpvoteFunctionality() {
    try {
      console.log('=== UPVOTE FUNCTIONALITY DEBUG TOOL ===');
      
      rl.question('Enter username or email: ', async (identifier) => {
        rl.question('Enter password: ', async (password) => {
          rl.question('Enter tool ID to upvote: ', async (toolId) => {
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
                success: loginData.success,
                hasToken: !!loginData.token,
                user: loginData.user ? {
                  _id: loginData.user._id,
                  username: loginData.user.username,
                } : null
              });
              
              if (!loginResponse.ok) {
                console.error('Login failed');
                rl.close();
                return;
              }
              
              const token = loginData.token;
              
              // 2. Try to upvote a tool
              console.log(`\nTrying to upvote tool ${toolId}...`);
              
              const upvoteResponse = await fetch(`http://localhost:5000/api/tools/${toolId}/upvote`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
              });
              
              const upvoteData = await upvoteResponse.json();
              
              console.log('Upvote response status:', upvoteResponse.status);
              console.log('Upvote response data:', upvoteData);
              
              if (upvoteResponse.ok) {
                console.log(`\n✅ Successfully ${upvoteData.userUpvoted ? 'upvoted' : 'removed upvote from'} the tool`);
                console.log(`New upvote count: ${upvoteData.upvotes}`);
              } else {
                console.error('\n❌ Failed to upvote tool');
                console.error('Error message:', upvoteData.message);
              }
            } catch (error) {
              console.error('\nError during upvote test:', error);
            } finally {
              rl.close();
            }
          });
        });
      });
    } catch (error) {
      console.error('Error:', error);
      rl.close();
    }
  }

  checkUpvoteFunctionality();
})();
