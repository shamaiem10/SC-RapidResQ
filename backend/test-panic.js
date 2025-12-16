/**
 * Test Script for Panic Button
 * Run this to test the emergency alert system
 */

const axios = require('axios');

async function testPanicButton() {
  console.log('🧪 Testing Panic Button...\n');

  try {
    // Replace these values with your actual data
    const PORT = 5000; // Your server port is 5000
    const USERNAME = 'shamaiem10'; // Your actual username

    console.log(`📡 Sending panic request for username: "${USERNAME}"`);
    console.log(`🔗 URL: http://localhost:${PORT}/api/panic\n`);

    const response = await axios.post(`http://localhost:${PORT}/api/panic`, {
      username: USERNAME
    });

    // Success response
    console.log('✅ SUCCESS! Panic button triggered successfully\n');
    console.log('📄 Response Data:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('\n📧 Check your email inbox for the emergency alert!');
    console.log('💡 Tip: Check spam folder if you don\'t see it in inbox\n');

  } catch (error) {
    // Error handling
    console.error('❌ ERROR! Panic button test failed\n');
    
    if (error.response) {
      // Server responded with error status
      console.error('Server Response:');
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message || error.response.data);
      
      // Helpful error messages
      if (error.response.status === 404) {
        console.error('\n💡 Fix: User not found. Make sure the username exists in your database.');
      } else if (error.response.status === 400) {
        console.error('\n💡 Fix: Check that username is provided and user has phone/location.');
      }
    } else if (error.request) {
      // Request was made but no response
      console.error('No response from server. Is your server running?');
      console.error('💡 Fix: Start your server with "npm start" or "node server.js"');
    } else {
      // Something else went wrong
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testPanicButton();