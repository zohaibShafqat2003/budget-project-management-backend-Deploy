// Script to toggle test mode for performance prediction
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Path to .env file
const envPath = path.join(__dirname, '.env');

// Read current .env file content
let envContent;
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (error) {
  console.error('Error reading .env file:', error.message);
  console.error('Creating a new .env file...');
  envContent = '';
}

// Check command line arguments
const args = process.argv.slice(2);
const enableTestMode = args.includes('--enable') || args.includes('-e');
const disableTestMode = args.includes('--disable') || args.includes('-d');
const showStatus = args.includes('--status') || args.includes('-s') || (!enableTestMode && !disableTestMode);

// Function to update .env file
function updateEnvFile(enable) {
  // Check if USE_TEST_DATA is already in the file
  if (envContent.includes('USE_TEST_DATA=')) {
    // Replace existing value
    envContent = envContent.replace(
      /USE_TEST_DATA=(true|false)/,
      `USE_TEST_DATA=${enable ? 'true' : 'false'}`
    );
  } else {
    // Add new entry
    envContent += `\nUSE_TEST_DATA=${enable ? 'true' : 'false'}`;
  }

  // Write back to .env file
  try {
    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Test mode ${enable ? 'enabled' : 'disabled'} successfully.`);
    console.log(`Performance predictions will now use ${enable ? 'pre-generated test data' : 'the Gemini API'}.`);
  } catch (error) {
    console.error('❌ Error updating .env file:', error.message);
  }
}

// Function to check current status
function checkStatus() {
  const testModeEnabled = /USE_TEST_DATA=true/.test(envContent);
  console.log(`Performance Prediction Test Mode: ${testModeEnabled ? '✅ ENABLED' : '❌ DISABLED'}`);
  console.log(`Currently using: ${testModeEnabled ? 'Pre-generated test data' : 'Gemini API'}`);
  
  // Show how to toggle
  console.log('\nTo change test mode:');
  console.log('  Enable:  node set-test-mode.js --enable');
  console.log('  Disable: node set-test-mode.js --disable');
}

// Execute based on arguments
if (enableTestMode) {
  updateEnvFile(true);
} else if (disableTestMode) {
  updateEnvFile(false);
} else if (showStatus) {
  checkStatus();
} 