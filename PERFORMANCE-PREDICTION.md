# Performance Prediction Feature

This document explains how to use the Performance Prediction feature in the project management system.

## Overview

The Performance Prediction feature uses AI to analyze project data and generate detailed predictions about:

- Timeline (completion date, delays, milestones)
- Budget (final cost, variance, risk areas)
- Quality (predicted score, potential issues)
- Recommendations for improvement
- Overall project health

## API Endpoints

### Get Detailed Predictions

```
GET /api/reports/projects/:projectId/detailed-predictions
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "projectName": "Project Name",
    "projectId": "project-id",
    "currentProgress": 65,
    "performancePrediction": {
      "timelinePrediction": {
        "predictedCompletionDate": "2024-04-15",
        "confidenceLevel": "Medium",
        "delayRisk": "Medium",
        "predictedDelay": 16,
        "keyMilestones": [...]
      },
      "budgetPrediction": {
        "predictedFinalCost": 132000,
        "predictedVariance": "10% over budget",
        "confidenceLevel": "Medium",
        "riskAreas": [...]
      },
      "qualityPrediction": {
        "predictedQualityScore": 7,
        "confidenceLevel": "Medium",
        "potentialIssues": [...]
      },
      "recommendations": [...],
      "overallHealthPrediction": {
        "score": 6,
        "trend": "Stable",
        "keyInsights": [...]
      }
    }
  }
}
```

## Development and Testing

### Test Mode

The system supports a test mode that uses pre-generated prediction data instead of making API calls to Gemini. This is useful for:

- Development without API costs
- Testing without internet connectivity
- Consistent data for UI development
- Faster response times

### Toggling Test Mode

Use the provided script to toggle between test mode and real API calls:

```bash
# Check current status
node set-test-mode.js

# Enable test mode (use pre-generated data)
node set-test-mode.js --enable

# Disable test mode (use Gemini API)
node set-test-mode.js --disable
```

### Available Test Data

The system includes 5 sample projects with different characteristics:

1. **E-commerce Platform Redesign** - In Progress (45% complete)
2. **Mobile App Development** - In Progress (72% complete)
3. **Data Migration Project** - At Risk (35% complete)
4. **Marketing Campaign Launch** - On Track (88% complete)
5. **Infrastructure Upgrade** - Delayed (52% complete)

When test mode is enabled, the system will select a prediction based on the last character of the project ID or randomly if no match is found.

### Viewing Test Data

To view the available test data:

```bash
# Show all available test data
node run-performance-prediction-test.js

# View a specific test dataset (0-4)
node run-performance-prediction-test.js 2
```

## Implementation Details

### Backend Implementation

The feature is implemented in:
- `report.controller.js` - `getDetailedPredictions` function
- `report.routes.js` - `/projects/:projectId/detailed-predictions` route

### Frontend Implementation

The frontend components are:
- `detailed-predictions.tsx` - Main component for displaying predictions
- `detailed-predictions/page.tsx` - Page component with project selector

### Test Data

Test data is stored in:
- `test-performance-prediction-data.js` - Pre-generated prediction data
- `test-performance-prediction.js` - Script to generate new predictions using Gemini API

## Environment Variables

- `USE_TEST_DATA` - Set to 'true' to use test data instead of Gemini API
- `GEMINI_API_KEY` - Required for real API calls when test mode is disabled 