/**
 * Script to demonstrate the risk mitigation form with test data
 */
require('dotenv').config();
const testData = require('./test-risk-mitigation-data');

// Get the sample scenarios
const sampleRiskScenarios = testData.sampleRiskScenarios;

// Print instructions
console.log('\n=== RISK MITIGATION FORM TEST DATA ===\n');
console.log('This script provides sample risk scenarios to test the risk mitigation form.');
console.log('Copy and paste the following data into your form to test it:\n');

// Display the first sample scenario with formatting
const sample = sampleRiskScenarios[0];
console.log('--- SAMPLE RISK SCENARIO ---');
console.log(`Project Name: ${sample.projectName}`);
console.log(`Risk Description: ${sample.riskDescription}`);
console.log(`Project Context: ${sample.projectContext}`);
console.log(`Current Mitigation: ${sample.currentMitigation}\n`);

console.log('--- INSTRUCTIONS ---');
console.log('1. Open the risk mitigation form at: http://localhost:3000/risk-mitigation');
console.log('2. Copy and paste the above values into the form fields');
console.log('3. Click "Generate Risk Mitigation Plan" to test the form');
console.log('\nThe form should generate a comprehensive risk mitigation plan using the Gemini API.\n');

console.log('--- AVAILABLE TEST SCENARIOS ---');
sampleRiskScenarios.forEach((scenario, index) => {
  console.log(`${index + 1}. ${scenario.projectName}: ${scenario.riskDescription.substring(0, 50)}...`);
});

console.log('\nTo view all scenarios in detail, check the backend/test-risk-mitigation-data.js file.');
console.log('\n=== END OF INSTRUCTIONS ===\n');

// If you want to test the API directly, uncomment this section:
/*
const axios = require('axios');

async function testRiskMitigationAPI() {
  try {
    const response = await axios.post('http://localhost:5000/api/reports/risk-mitigation', sampleRiskScenarios[0]);
    console.log('API Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
  }
}

testRiskMitigationAPI();
*/ 