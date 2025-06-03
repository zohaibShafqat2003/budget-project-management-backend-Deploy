// Pre-generated test data for Performance Prediction feature
// This allows testing without making actual API calls

// Sample projects (same as in test-performance-prediction.js)
const sampleProjects = [
  {
    name: "E-commerce Platform Redesign",
    status: "In Progress",
    progress: 45,
    tasks: {
      total: 32,
      completed: 14
    },
    budget: {
      total: 120000,
      spent: 58000
    },
    timeline: {
      startDate: "2023-09-15",
      completionDate: "2024-03-30",
      elapsed: 60
    }
  },
  {
    name: "Mobile App Development",
    status: "In Progress",
    progress: 72,
    tasks: {
      total: 45,
      completed: 32
    },
    budget: {
      total: 85000,
      spent: 72000
    },
    timeline: {
      startDate: "2023-11-01",
      completionDate: "2024-02-15",
      elapsed: 85
    }
  },
  {
    name: "Data Migration Project",
    status: "At Risk",
    progress: 35,
    tasks: {
      total: 28,
      completed: 9
    },
    budget: {
      total: 65000,
      spent: 42000
    },
    timeline: {
      startDate: "2023-12-10",
      completionDate: "2024-02-28",
      elapsed: 75
    }
  },
  {
    name: "Marketing Campaign Launch",
    status: "On Track",
    progress: 88,
    tasks: {
      total: 18,
      completed: 16
    },
    budget: {
      total: 45000,
      spent: 38000
    },
    timeline: {
      startDate: "2024-01-05",
      completionDate: "2024-02-20",
      elapsed: 90
    }
  },
  {
    name: "Infrastructure Upgrade",
    status: "Delayed",
    progress: 52,
    tasks: {
      total: 24,
      completed: 12
    },
    budget: {
      total: 95000,
      spent: 68000
    },
    timeline: {
      startDate: "2023-10-20",
      completionDate: "2024-01-31",
      elapsed: 95
    }
  }
];

// Pre-generated performance predictions for each project
const samplePredictions = [
  // E-commerce Platform Redesign
  {
    "timelinePrediction": {
      "predictedCompletionDate": "2024-04-15",
      "confidenceLevel": "Medium",
      "delayRisk": "Medium",
      "predictedDelay": 16,
      "keyMilestones": [
        {
          "name": "Frontend Implementation",
          "predictedDate": "2024-01-30",
          "riskFactors": ["Resource constraints", "Design changes"]
        },
        {
          "name": "Backend Integration",
          "predictedDate": "2024-03-10",
          "riskFactors": ["Technical complexity", "API dependencies"]
        },
        {
          "name": "User Testing",
          "predictedDate": "2024-03-30",
          "riskFactors": ["Feedback implementation delays", "Bug fixes"]
        }
      ]
    },
    "budgetPrediction": {
      "predictedFinalCost": 132000,
      "predictedVariance": "10% over budget",
      "confidenceLevel": "Medium",
      "riskAreas": [
        "Design revisions requiring additional development",
        "Third-party integration costs",
        "Extended QA testing phase"
      ]
    },
    "qualityPrediction": {
      "predictedQualityScore": 7,
      "confidenceLevel": "Medium",
      "potentialIssues": [
        "Mobile responsiveness issues",
        "Performance bottlenecks during high traffic",
        "Payment gateway integration challenges"
      ]
    },
    "recommendations": [
      {
        "area": "Timeline",
        "recommendation": "Prioritize critical path features and consider phased deployment",
        "impact": "High",
        "effort": "Medium"
      },
      {
        "area": "Budget",
        "recommendation": "Review third-party services and consider alternatives",
        "impact": "Medium",
        "effort": "Low"
      },
      {
        "area": "Resources",
        "recommendation": "Add a senior developer to address technical challenges",
        "impact": "High",
        "effort": "High"
      }
    ],
    "overallHealthPrediction": {
      "score": 6,
      "trend": "Stable",
      "keyInsights": [
        "Project is progressing but facing moderate challenges",
        "Timeline slippage is the primary concern",
        "Quality targets are achievable with proper resource allocation"
      ]
    }
  },
  
  // Mobile App Development
  {
    "timelinePrediction": {
      "predictedCompletionDate": "2024-02-25",
      "confidenceLevel": "High",
      "delayRisk": "Low",
      "predictedDelay": 10,
      "keyMilestones": [
        {
          "name": "Feature Freeze",
          "predictedDate": "2024-01-20",
          "riskFactors": ["Scope creep"]
        },
        {
          "name": "Beta Testing",
          "predictedDate": "2024-02-05",
          "riskFactors": ["User feedback integration"]
        },
        {
          "name": "App Store Submission",
          "predictedDate": "2024-02-20",
          "riskFactors": ["App store review process"]
        }
      ]
    },
    "budgetPrediction": {
      "predictedFinalCost": 92000,
      "predictedVariance": "8.2% over budget",
      "confidenceLevel": "High",
      "riskAreas": [
        "Additional QA resources needed",
        "Extended beta testing period"
      ]
    },
    "qualityPrediction": {
      "predictedQualityScore": 8,
      "confidenceLevel": "High",
      "potentialIssues": [
        "Minor UI inconsistencies across devices",
        "Battery optimization for older devices"
      ]
    },
    "recommendations": [
      {
        "area": "Quality",
        "recommendation": "Conduct focused testing on older device models",
        "impact": "Medium",
        "effort": "Low"
      },
      {
        "area": "Timeline",
        "recommendation": "Begin app store submission preparation in parallel with final testing",
        "impact": "Medium",
        "effort": "Low"
      }
    ],
    "overallHealthPrediction": {
      "score": 8,
      "trend": "Improving",
      "keyInsights": [
        "Project is on track for successful completion",
        "High task completion rate indicates good momentum",
        "Minor budget overrun is acceptable given the progress"
      ]
    }
  },
  
  // Data Migration Project
  {
    "timelinePrediction": {
      "predictedCompletionDate": "2024-04-15",
      "confidenceLevel": "Low",
      "delayRisk": "High",
      "predictedDelay": 46,
      "keyMilestones": [
        {
          "name": "Data Mapping Completion",
          "predictedDate": "2024-01-30",
          "riskFactors": ["Data inconsistencies", "Schema complexity"]
        },
        {
          "name": "Test Migration",
          "predictedDate": "2024-03-10",
          "riskFactors": ["Performance issues", "Data integrity problems"]
        },
        {
          "name": "Production Migration",
          "predictedDate": "2024-04-10",
          "riskFactors": ["System downtime constraints", "Rollback contingencies"]
        }
      ]
    },
    "budgetPrediction": {
      "predictedFinalCost": 85000,
      "predictedVariance": "30.8% over budget",
      "confidenceLevel": "Medium",
      "riskAreas": [
        "Additional development resources needed",
        "Extended testing phase",
        "Potential need for specialized consultants"
      ]
    },
    "qualityPrediction": {
      "predictedQualityScore": 5,
      "confidenceLevel": "Low",
      "potentialIssues": [
        "Data integrity issues",
        "Performance degradation",
        "Incomplete data mapping",
        "Integration failures with existing systems"
      ]
    },
    "recommendations": [
      {
        "area": "Resources",
        "recommendation": "Bring in a data migration specialist immediately",
        "impact": "High",
        "effort": "Medium"
      },
      {
        "area": "Timeline",
        "recommendation": "Revise project plan with more realistic milestones",
        "impact": "High",
        "effort": "Medium"
      },
      {
        "area": "Quality",
        "recommendation": "Implement comprehensive data validation framework",
        "impact": "High",
        "effort": "High"
      }
    ],
    "overallHealthPrediction": {
      "score": 4,
      "trend": "Declining",
      "keyInsights": [
        "Project is at significant risk of failure",
        "Current approach is not sustainable",
        "Immediate intervention required to address fundamental issues"
      ]
    }
  },
  
  // Marketing Campaign Launch
  {
    "timelinePrediction": {
      "predictedCompletionDate": "2024-02-22",
      "confidenceLevel": "High",
      "delayRisk": "Low",
      "predictedDelay": 2,
      "keyMilestones": [
        {
          "name": "Content Creation",
          "predictedDate": "2024-01-25",
          "riskFactors": ["Approval delays"]
        },
        {
          "name": "Platform Setup",
          "predictedDate": "2024-02-10",
          "riskFactors": ["Technical integration issues"]
        },
        {
          "name": "Campaign Launch",
          "predictedDate": "2024-02-20",
          "riskFactors": ["Last-minute stakeholder changes"]
        }
      ]
    },
    "budgetPrediction": {
      "predictedFinalCost": 43000,
      "predictedVariance": "4.4% under budget",
      "confidenceLevel": "High",
      "riskAreas": [
        "Potential ad spend adjustments based on initial performance"
      ]
    },
    "qualityPrediction": {
      "predictedQualityScore": 9,
      "confidenceLevel": "High",
      "potentialIssues": [
        "Minor messaging inconsistencies across platforms"
      ]
    },
    "recommendations": [
      {
        "area": "Quality",
        "recommendation": "Conduct final messaging review across all platforms",
        "impact": "Medium",
        "effort": "Low"
      },
      {
        "area": "Budget",
        "recommendation": "Prepare contingency for potential ad spend optimization",
        "impact": "Medium",
        "effort": "Low"
      }
    ],
    "overallHealthPrediction": {
      "score": 9,
      "trend": "Improving",
      "keyInsights": [
        "Project is on track for successful completion",
        "High task completion rate and quality indicators",
        "Minor adjustments needed for optimal outcome"
      ]
    }
  },
  
  // Infrastructure Upgrade
  {
    "timelinePrediction": {
      "predictedCompletionDate": "2024-03-15",
      "confidenceLevel": "Medium",
      "delayRisk": "High",
      "predictedDelay": 43,
      "keyMilestones": [
        {
          "name": "Hardware Deployment",
          "predictedDate": "2024-02-15",
          "riskFactors": ["Supply chain delays", "Installation complications"]
        },
        {
          "name": "System Migration",
          "predictedDate": "2024-03-01",
          "riskFactors": ["Compatibility issues", "Data transfer problems"]
        },
        {
          "name": "Testing & Validation",
          "predictedDate": "2024-03-10",
          "riskFactors": ["Performance issues", "Security vulnerabilities"]
        }
      ]
    },
    "budgetPrediction": {
      "predictedFinalCost": 110000,
      "predictedVariance": "15.8% over budget",
      "confidenceLevel": "Medium",
      "riskAreas": [
        "Additional hardware requirements",
        "Extended consultant engagement",
        "Unforeseen compatibility issues"
      ]
    },
    "qualityPrediction": {
      "predictedQualityScore": 6,
      "confidenceLevel": "Medium",
      "potentialIssues": [
        "Performance bottlenecks during peak loads",
        "Incomplete documentation",
        "Knowledge transfer gaps",
        "Security configuration weaknesses"
      ]
    },
    "recommendations": [
      {
        "area": "Timeline",
        "recommendation": "Develop a detailed cutover plan with clear rollback procedures",
        "impact": "High",
        "effort": "Medium"
      },
      {
        "area": "Resources",
        "recommendation": "Ensure vendor technical resources are available during critical phases",
        "impact": "High",
        "effort": "Low"
      },
      {
        "area": "Quality",
        "recommendation": "Conduct comprehensive load testing before final migration",
        "impact": "High",
        "effort": "Medium"
      }
    ],
    "overallHealthPrediction": {
      "score": 5,
      "trend": "Stable",
      "keyInsights": [
        "Project is significantly delayed but stabilizing",
        "Technical challenges are being addressed but slowly",
        "Additional oversight and planning needed to ensure success"
      ]
    }
  }
];

// Function to get a sample project by index
function getSampleProject(index = 0) {
  if (index < 0 || index >= sampleProjects.length) {
    console.error(`Invalid project index: ${index}. Must be between 0 and ${sampleProjects.length - 1}`);
    return null;
  }
  return sampleProjects[index];
}

// Function to get a sample prediction by index
function getSamplePrediction(index = 0) {
  if (index < 0 || index >= samplePredictions.length) {
    console.error(`Invalid prediction index: ${index}. Must be between 0 and ${samplePredictions.length - 1}`);
    return null;
  }
  return samplePredictions[index];
}

// Function to get a project with its prediction
function getSampleProjectWithPrediction(index = 0) {
  const project = getSampleProject(index);
  const prediction = getSamplePrediction(index);
  
  if (!project || !prediction) return null;
  
  return {
    project,
    prediction
  };
}

// Function to display a sample prediction
function displaySamplePrediction(index = 0) {
  const data = getSampleProjectWithPrediction(index);
  if (!data) return;
  
  console.log(`\n=== Sample Project: "${data.project.name}" ===\n`);
  console.log(JSON.stringify(data.project, null, 2));
  
  console.log(`\n=== Performance Prediction ===\n`);
  console.log(JSON.stringify(data.prediction, null, 2));
}

// If this script is run directly, display the first sample
if (require.main === module) {
  const index = process.argv[2] ? parseInt(process.argv[2]) : 0;
  displaySamplePrediction(index);
}

module.exports = {
  sampleProjects,
  samplePredictions,
  getSampleProject,
  getSamplePrediction,
  getSampleProjectWithPrediction,
  displaySamplePrediction
}; 