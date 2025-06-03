// Simplified test data for Performance Prediction feature
// This allows testing without making actual API calls

// Pre-generated performance predictions
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

// Sample project names
const sampleProjectNames = [
  "E-commerce Platform Redesign",
  "Mobile App Development",
  "Data Migration Project",
  "Marketing Campaign Launch",
  "Infrastructure Upgrade"
];

// Function to get a sample prediction by index
function getSamplePrediction(index = 0) {
  if (index < 0 || index >= samplePredictions.length) {
    console.error(`Invalid prediction index: ${index}. Must be between 0 and ${samplePredictions.length - 1}`);
    return samplePredictions[0];
  }
  return samplePredictions[index];
}

// Function to get a sample project name by index
function getSampleProject(index = 0) {
  if (index < 0 || index >= sampleProjectNames.length) {
    return { name: "Sample Project", progress: 50 };
  }
  return { 
    name: sampleProjectNames[index],
    progress: [45, 72, 35, 88, 52][index]
  };
}

module.exports = {
  samplePredictions,
  getSamplePrediction,
  getSampleProject
}; 