// Simple script to run and demonstrate the performance prediction test data
const { 
  sampleProjects, 
  samplePredictions, 
  displaySamplePrediction 
} = require('./test-performance-prediction-data');

console.log('=== Performance Prediction Test Data ===');
console.log(`\nThis script demonstrates the sample data for testing the Performance Prediction feature.`);
console.log(`There are ${sampleProjects.length} sample projects with pre-generated predictions.\n`);

console.log('Available sample projects:');
sampleProjects.forEach((project, index) => {
  console.log(`${index}: ${project.name} (${project.status}, ${project.progress}% complete)`);
});

console.log('\nTo view a specific project prediction, run:');
console.log('node run-performance-prediction-test.js <project-index>');

// Check if a specific project index was provided as a command line argument
const projectIndex = process.argv[2] ? parseInt(process.argv[2]) : null;

if (projectIndex !== null) {
  // Display the specified project
  displaySamplePrediction(projectIndex);
} else {
  // Display instructions for how to use this test data
  console.log('\n=== How to Use This Test Data ===');
  console.log('1. Import the test data in your controller:');
  console.log('   const { getSamplePrediction } = require(\'./test-performance-prediction-data\');');
  console.log('\n2. Use the mock data in your controller:');
  console.log('   // In your getDetailedPredictions controller function:');
  console.log('   // Instead of calling Gemini API, use:');
  console.log('   const mockPrediction = getSamplePrediction(0); // Get first sample prediction');
  console.log('   return res.status(200).json({');
  console.log('     success: true,');
  console.log('     data: {');
  console.log('       projectName: "Your Project Name",');
  console.log('       projectId: projectId,');
  console.log('       currentProgress: 50,');
  console.log('       performancePrediction: mockPrediction');
  console.log('     }');
  console.log('   });');
  
  console.log('\n3. For testing frontend components:');
  console.log('   // Mock the API response in your tests:');
  console.log('   const mockApiResponse = {');
  console.log('     success: true,');
  console.log('     data: {');
  console.log('       projectName: "Test Project",');
  console.log('       projectId: "test-id",');
  console.log('       currentProgress: 65,');
  console.log('       performancePrediction: samplePredictions[0]');
  console.log('     }');
  console.log('   };');
} 