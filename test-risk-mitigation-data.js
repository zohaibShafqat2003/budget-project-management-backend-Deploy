/**
 * Sample risk mitigation scenarios for testing the risk mitigation form
 * Copy and paste these examples into the form to quickly test functionality
 */

const sampleRiskScenarios = [
  {
    projectName: "E-Commerce Platform Migration",
    riskDescription: "Potential data loss during migration from legacy system to new cloud-based platform",
    projectContext: "We're migrating our 10-year-old on-premise e-commerce platform to a new cloud-based solution. The migration involves transferring 5TB of customer data, product catalogs, and transaction history.",
    currentMitigation: "We've scheduled the migration during off-peak hours and have created a basic backup of the database."
  },
  {
    projectName: "Mobile App Development",
    riskDescription: "Third-party API dependency may cause delays if vendor changes their API without notice",
    projectContext: "We're developing a mobile app that relies heavily on three external APIs for payment processing, mapping, and social media integration.",
    currentMitigation: "We've reviewed the API documentation and set up basic monitoring."
  },
  {
    projectName: "Hospital Management System",
    riskDescription: "Security breach leading to exposure of sensitive patient data",
    projectContext: "We're implementing a new hospital management system that will store and process sensitive patient records, including medical history, personal information, and payment details.",
    currentMitigation: "Standard encryption and password policies are in place."
  },
  {
    projectName: "Construction Project",
    riskDescription: "Supply chain disruptions causing material shortages and price increases",
    projectContext: "We're building a 20-story commercial building with specialized materials that need to be sourced from international suppliers.",
    currentMitigation: "We've identified primary suppliers but have no backup options in place."
  },
  {
    projectName: "AI Model Deployment",
    riskDescription: "Model bias leading to unfair or discriminatory outcomes for certain user groups",
    projectContext: "We're deploying a machine learning model for credit scoring that will be used to make lending decisions for customers.",
    currentMitigation: "Basic testing has been done on the training data, but no comprehensive bias audit has been performed."
  }
];

// Example of a complete risk mitigation plan response
const sampleMitigationPlanResponse = {
  success: true,
  data: {
    projectName: "E-Commerce Platform Migration",
    riskDescription: "Potential data loss during migration from legacy system to new cloud-based platform",
    mitigationPlan: {
      riskAssessment: {
        severity: "High",
        likelihood: "Medium",
        impact: "Data loss could result in loss of customer trust, financial records, inventory accuracy, and historical analytics. Recovery would be extremely difficult and potentially incomplete.",
        riskScore: 8
      },
      mitigationPlan: {
        strategy: "Reduction",
        recommendedActions: [
          {
            action: "Create multiple redundant backups using different storage technologies",
            priority: "High",
            timeframe: "Immediate",
            responsibleParty: "Database Administrator"
          },
          {
            action: "Develop and test a rollback plan to quickly revert to the legacy system",
            priority: "High",
            timeframe: "Immediate",
            responsibleParty: "Migration Team Lead"
          },
          {
            action: "Perform multiple test migrations with subsets of data before full migration",
            priority: "Medium",
            timeframe: "Short-term",
            responsibleParty: "Migration Team"
          },
          {
            action: "Implement real-time data validation checks during migration process",
            priority: "Medium",
            timeframe: "Short-term",
            responsibleParty: "Development Team"
          }
        ],
        contingencyPlan: "If data loss occurs, immediately halt the migration process and activate the rollback procedure. Use the redundant backups to restore lost data. Notify stakeholders according to the communication plan and provide regular updates on recovery progress."
      },
      monitoringPlan: {
        keyIndicators: [
          "Data integrity checksums before and after migration",
          "System error logs during migration process",
          "Database record counts and table structure verification",
          "Application functionality tests post-migration"
        ],
        monitoringFrequency: "Hourly",
        triggerPoints: [
          "Any checksum mismatch between source and target data",
          "Error rate exceeding 0.1% of records processed",
          "Migration process taking 25% longer than estimated time",
          "Any critical system errors during the migration process"
        ]
      }
    }
  }
};

// Instructions for using this test data:
/*
To use these examples:

1. Copy one of the sample risk scenarios
2. Open your risk mitigation form
3. Paste the values into the corresponding form fields
4. Submit the form to generate a mitigation plan

For testing error handling, try submitting with:
- Empty required fields
- Very short descriptions
- Extremely long text in all fields
*/

console.log("Sample risk scenarios for testing:");
console.log(JSON.stringify(sampleRiskScenarios[0], null, 2));
console.log("\nTo use: Copy the values into your risk mitigation form fields.");

// Export the samples if needed for other test scripts
module.exports = {
  sampleRiskScenarios,
  sampleMitigationPlanResponse
}; 