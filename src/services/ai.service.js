const logger = require('../config/logger');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini API
const geminiApiKey = process.env.GEMINI_API_KEY;
let genAI = null;

// Initialize Gemini client if API key is available
if (geminiApiKey) {
  genAI = new GoogleGenerativeAI(geminiApiKey);
  logger.info('Gemini AI service initialized successfully');
} else {
  logger.warn('Gemini AI service not initialized - API key missing');
}

// List available models (uncomment for debugging)
// async function listModels() {
//   if (!genAI) return [];
//   try {
//     const models = await genAI.listModels();
//     logger.info('Available models:', models.map(m => m.name));
//     return models;
//   } catch (error) {
//     logger.error('Error listing models:', error);
//     return [];
//   }
// }
// listModels();

/**
 * Generate AI insights based on project data
 * @param {Object} projectData - Project data to analyze
 * @returns {Array} Array of insights
 */
const generateAIInsights = async (projectData) => {
  try {
        // If Gemini is not available, return fallback insights
    if (!genAI) {
      logger.debug('Using fallback AI insights generation');
      return generateFallbackInsights(projectData);
    }

    // Format project data for the AI prompt
    const prompt = formatProjectDataForPrompt(projectData);

    // Try with gemini-2.0-flash first, fall back to gemini-pro if needed
    let model;
    try {
      model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    } catch (modelError) {
      logger.warn('Failed to use gemini-2.0-flash, falling back to gemini-pro:', modelError.message);
      model = genAI.getGenerativeModel({ model: "gemini-pro" });
    }

    // Set up generation config for more reliable JSON output
    const generationConfig = {
      temperature: 0.2,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 1024,
    };

    // Generate content with safety settings
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
      ],
    });

    const response = await result.response;
    const text = response.text();

    // Parse the response
    return parseGeminiResponse(text);
  } catch (error) {
    logger.error('Error generating AI insights:', error);
    return generateFallbackInsights(projectData);
  }
};

/**
 * Format project data for AI prompt
 * @param {Object} projectData - Project data to format
 * @returns {String} Formatted prompt
 */
const formatProjectDataForPrompt = (projectData) => {
  return `
    You are an expert AI project management assistant analyzing project data to provide actionable insights and recommendations.
    
    Project Data:
    - Project Name: ${projectData.name || 'Untitled Project'}
    - Status: ${projectData.status || 'Unknown'}
    - Progress: ${projectData.progress || 0}% complete
    - Budget: Total $${projectData.totalBudget || 0}, Used $${projectData.usedBudget || 0}
    - Timeline: Started ${projectData.startDate || 'N/A'}, Expected completion ${projectData.completionDate || 'N/A'}
    - Tasks: ${projectData.tasks ? `${projectData.tasks.length} tasks, ${projectData.tasks.filter(t => t.status === 'Completed').length} completed` : 'No task data'}
    - Budget Utilization: ${projectData.budgetUtilization || 0}%
    
    Based on this data, provide exactly 5 insights in the following JSON format:
    [
      {
        "type": "Warning|Critical|Positive|Informational",
        "category": "Tasks|Budget|Timeline|General|Resources",
        "message": "Clear, concise insight about the project status",
        "recommendation": "Specific, actionable recommendation to address the insight"
      },
      ...
    ]
    
    Include at least one insight for each type (Warning, Critical, Positive, Informational) if applicable.
    Focus on practical, actionable recommendations that would help the project manager improve outcomes.
    Your response must be valid JSON that can be parsed directly.
  `;
};

/**
 * Generate budget optimization recommendations
 * @param {Object} budgetData - Budget and expense data
 * @returns {Array} Budget optimization recommendations
 */
const generateBudgetOptimizations = async (budgetData) => {
  try {
    // If Gemini is not available, return fallback recommendations
    if (!genAI) {
      logger.debug('Using fallback budget optimization generation');
      return generateFallbackBudgetOptimizations(budgetData);
    }

    const prompt = `
      As an AI financial advisor for project management, analyze this budget data and provide optimization recommendations:
      
      Budget Summary:
      - Total Budget: $${budgetData.totalBudget || 0}
      - Total Spent: $${budgetData.totalSpent || 0}
      - Remaining: $${budgetData.remaining || 0}
      - Budget Utilization: ${budgetData.utilizationPercentage || 0}%
      
      Expense Categories:
      ${budgetData.categories.map(cat => `- ${cat.name}: $${cat.amount} (${cat.percentage}% of total)`).join('\n')}
      
      Project Completion: ${budgetData.projectProgress || 0}%
      
      Provide 3-4 specific budget optimization recommendations in this JSON format:
      [
        {
          "title": "Brief title of recommendation",
          "description": "Detailed explanation of the issue identified",
          "action": "Specific action steps to optimize budget",
          "impact": "Estimated impact (High/Medium/Low)",
          "savings": "Estimated potential savings as percentage or dollar amount"
        },
        ...
      ]
      
      Your response must be valid JSON that can be parsed directly.
    `;

    // Try with gemini-2.0-flash first, fall back to gemini-pro if needed
    let model;
    try {
      model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    } catch (modelError) {
      logger.warn('Failed to use gemini-2.0-flash, falling back to gemini-pro:', modelError.message);
      model = genAI.getGenerativeModel({ model: "gemini-pro" });
    }

    // Generate content with optimized settings for structured output
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        maxOutputTokens: 1024,
      }
    });

    const response = await result.response;
    const text = response.text();

    // Parse the response
    return parseGeminiResponse(text);
  } catch (error) {
    logger.error('Error generating budget optimizations:', error);
    return generateFallbackBudgetOptimizations(budgetData);
  }
};

/**
 * Parse Gemini API response
 * @param {String} response - Raw response from Gemini API
 * @returns {Array} Parsed insights
 */
const parseGeminiResponse = (response) => {
  try {
    // Extract JSON from the response (in case there's additional text)
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // If no JSON found, try to parse the entire response
    return JSON.parse(response);
  } catch (error) {
    logger.error('Error parsing Gemini response:', error);
    return [
      {
        type: 'Informational',
        category: 'General',
        message: 'Unable to generate AI insights at this time.',
        recommendation: 'Please try again later or contact support if the issue persists.'
      }
    ];
  }
};

/**
 * Generate fallback insights when AI service is unavailable
 * @param {Object} projectData - Project data to analyze
 * @returns {Array} Fallback insights
 */
const generateFallbackInsights = (projectData) => {
  const insights = [];
  
  // Basic project progress insight
  if (projectData.progress) {
    const progress = projectData.progress;
    if (progress < 25) {
      insights.push({
        type: 'Informational',
        category: 'General',
        message: 'Project is in its early stages.',
        recommendation: 'Ensure requirements are clear and team is aligned on objectives.'
      });
    } else if (progress >= 25 && progress < 50) {
      insights.push({
        type: 'Informational',
        category: 'General',
        message: 'Project is approaching the midpoint.',
        recommendation: 'Review initial progress and adjust timeline if necessary.'
      });
    } else if (progress >= 50 && progress < 75) {
      insights.push({
        type: 'Informational',
        category: 'General',
        message: 'Project is past the halfway point.',
        recommendation: 'Focus on completing critical path tasks and addressing any blockers.'
      });
    } else {
      insights.push({
        type: 'Positive',
        category: 'General',
        message: 'Project is nearing completion.',
        recommendation: 'Prepare for final delivery and ensure all deliverables meet requirements.'
      });
    }
  }
  
  // Budget insight
  if (projectData.totalBudget && projectData.usedBudget) {
    const budgetUsagePercentage = (projectData.usedBudget / projectData.totalBudget) * 100;
    if (budgetUsagePercentage > 90 && (projectData.progress || 0) < 80) {
      insights.push({
        type: 'Critical',
        category: 'Budget',
        message: 'Budget usage is significantly ahead of project progress.',
        recommendation: 'Review expenses immediately and implement cost-control measures.'
      });
    } else if (budgetUsagePercentage > 75 && (projectData.progress || 0) < 60) {
      insights.push({
        type: 'Warning',
        category: 'Budget',
        message: 'Budget usage is ahead of project progress.',
        recommendation: 'Monitor expenses closely and identify potential areas for savings.'
      });
    }
  }
  
  // Timeline insight
  if (projectData.startDate && projectData.completionDate) {
    const now = new Date();
    const start = new Date(projectData.startDate);
    const end = new Date(projectData.completionDate);
    
    if (end < now) {
      insights.push({
        type: 'Critical',
        category: 'Timeline',
        message: 'Project has passed its planned completion date.',
        recommendation: 'Establish a revised timeline and communicate with stakeholders.'
      });
    } else {
      const totalDuration = end.getTime() - start.getTime();
      const elapsed = now.getTime() - start.getTime();
      const timePercentUsed = (elapsed / totalDuration) * 100;
      
      if (timePercentUsed > 70 && (projectData.progress || 0) < 50) {
        insights.push({
          type: 'Warning',
          category: 'Timeline',
          message: 'Project progress is behind schedule.',
          recommendation: 'Consider adding resources or adjusting scope to meet the deadline.'
        });
      }
    }
  }
  
  // Task insight
  if (projectData.tasks) {
    const tasks = projectData.tasks;
    const overdueTasks = tasks.filter(task => 
      task.status !== 'Completed' && 
      task.dueDate && 
      new Date(task.dueDate) < new Date()
    );
    
    if (overdueTasks.length > 0) {
      insights.push({
        type: 'Warning',
        category: 'Tasks',
        message: `There are ${overdueTasks.length} overdue tasks.`,
        recommendation: 'Prioritize overdue tasks and consider reassigning if necessary.'
      });
    }
  }
  
  // Ensure we have at least one insight
  if (insights.length === 0) {
    insights.push({
      type: 'Informational',
      category: 'General',
      message: 'Project appears to be progressing normally.',
      recommendation: 'Continue regular monitoring and team check-ins.'
    });
  }
  
  return insights;
};

/**
 * Generate fallback budget optimizations
 * @param {Object} budgetData - Budget data to analyze
 * @returns {Array} Fallback budget optimizations
 */
const generateFallbackBudgetOptimizations = (budgetData) => {
  const recommendations = [];
  
  // Check budget utilization vs project progress
  if (budgetData.utilizationPercentage > budgetData.projectProgress + 10) {
    recommendations.push({
      title: "Budget Overutilization",
      description: `Budget utilization (${budgetData.utilizationPercentage}%) is ahead of project progress (${budgetData.projectProgress}%)`,
      action: "Review recent expenses and implement stricter approval process for new expenditures",
      impact: "High",
      savings: "5-10% of remaining budget"
    });
  }
  
  // Check for high-spending categories
  const highSpendingCategories = budgetData.categories
    .filter(cat => cat.percentage > 30)
    .sort((a, b) => b.percentage - a.percentage);
  
  if (highSpendingCategories.length > 0) {
    recommendations.push({
      title: `Optimize ${highSpendingCategories[0].name} Expenses`,
      description: `${highSpendingCategories[0].name} represents ${highSpendingCategories[0].percentage}% of total expenses`,
      action: `Negotiate better rates or consider alternative vendors for ${highSpendingCategories[0].name.toLowerCase()} services`,
      impact: "Medium",
      savings: `7-12% of ${highSpendingCategories[0].name} expenses`
    });
  }
  
  // General recommendation for resource allocation
  recommendations.push({
    title: "Resource Allocation Review",
    description: "Regular resource allocation reviews can identify inefficiencies",
    action: "Conduct bi-weekly resource allocation meetings to adjust assignments based on project priorities",
    impact: "Medium",
    savings: "3-5% of overall budget"
  });
  
  // Add a recommendation about forecasting
  recommendations.push({
    title: "Improve Expense Forecasting",
    description: "Better forecasting can prevent budget overruns",
    action: "Implement rolling forecasts updated bi-weekly to anticipate budget needs",
    impact: "Medium",
    savings: "Potential prevention of 8-15% budget overrun"
  });
  
  return recommendations;
};

/**
 * Generate a project summary
 * @param {Object} projectData - Project data to summarize
 * @returns {String} Project summary
 */
const generateProjectSummary = async (projectData) => {
  try {
    // If Gemini is not available, return fallback summary
    if (!genAI) {
      logger.debug('Using fallback project summary generation');
      return generateFallbackProjectSummary(projectData);
    }

    const prompt = `
      Create a concise executive summary of this project:
      
      Project Name: ${projectData.name || 'Untitled Project'}
      Status: ${projectData.status || 'Unknown'}
      Progress: ${projectData.progress || 0}% complete
      Budget: Total $${projectData.totalBudget || 0}, Used $${projectData.usedBudget || 0}
      Timeline: Started ${projectData.startDate || 'N/A'}, Expected completion ${projectData.completionDate || 'N/A'}
      Description: ${projectData.description || 'No description provided'}
      
      Write a professional 3-4 sentence executive summary highlighting key aspects, current status, and outlook.
      Keep it factual, concise, and focused on the most important information a stakeholder would need.
    `;

    // Try with gemini-2.0-flash first, fall back to gemini-pro if needed
    let model;
    try {
      model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    } catch (modelError) {
      logger.warn('Failed to use gemini-2.0-flash, falling back to gemini-pro:', modelError.message);
      model = genAI.getGenerativeModel({ model: "gemini-pro" });
    }

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    logger.error('Error generating project summary:', error);
    return generateFallbackProjectSummary(projectData);
  }
};

/**
 * Generate fallback project summary
 * @param {Object} projectData - Project data to summarize
 * @returns {String} Fallback project summary
 */
const generateFallbackProjectSummary = (projectData) => {
  const status = projectData.status || 'in progress';
  const progress = projectData.progress || 0;
  const budgetUsed = projectData.usedBudget || 0;
  const totalBudget = projectData.totalBudget || 0;
  const budgetPercentage = totalBudget > 0 ? Math.round((budgetUsed / totalBudget) * 100) : 0;
  
  return `${projectData.name || 'This project'} is currently ${status.toLowerCase()} with ${progress}% of work completed. Budget utilization is at ${budgetPercentage}% of the allocated funds. The project ${new Date(projectData.completionDate) > new Date() ? 'is scheduled to be completed by ' + new Date(projectData.completionDate).toLocaleDateString() : 'completion date needs review'}.`;
};

module.exports = {
  generateAIInsights,
  generateProjectSummary,
  generateBudgetOptimizations
}; 