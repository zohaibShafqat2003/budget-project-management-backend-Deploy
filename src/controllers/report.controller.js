const { 
  Project, 
  BudgetItem, 
  Expense, 
  User, 
  Task, 
  Sprint, 
  Client,
  Board,
  sequelize 
} = require('../models');
const { Sequelize, Op } = require('sequelize');
const logger = require('../config/logger');
const { formatCurrency } = require('../utils/format.utils');
const { generateAIInsights, generateProjectSummary } = require('../services/ai.service');

/**
 * Get project summary reports
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Project summary report data
 */
const getProjectSummaryReports = async (req, res) => {
  try {
    // Get project status distribution
    const projectStatusData = await Project.findAll({
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['status'],
      where: {
        deletedAt: null
      }
    });

    // Get project timeline data
    const projectTimelineData = await Project.findAll({
      attributes: [
        'id',
        'name',
        'startDate',
        'completionDate',
        'status',
        'progress'
      ],
      where: {
        deletedAt: null
      },
      limit: 10,
      order: [['updatedAt', 'DESC']]
    });

    // Get AI-generated project summaries
    const projectSummaries = await Project.findAll({
      attributes: [
        'id',
        'name',
        'status',
        'progress',
        'totalBudget',
        'startDate',
        'completionDate',
        'narrativeDescription'
      ],
      where: {
        deletedAt: null,
        status: {
          [Op.not]: 'Completed'
        }
      },
      limit: 3,
      order: [['updatedAt', 'DESC']],
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['name']
        }
      ]
    });

    // Format the summaries for AI-like response
    const formattedSummaries = await Promise.all(projectSummaries.map(async project => {
      const usedBudget = project.totalBudget * ((project.progress || 0) / 100);
      const budgetUtilization = project.totalBudget ? Math.round((usedBudget / project.totalBudget) * 100) : 0;
      
      // Use AI service to generate the summary if possible
      const summaryData = {
        name: project.name,
        progress: project.progress || 0,
        totalBudget: project.totalBudget || 0,
        budgetUtilization: budgetUtilization,
        status: project.status,
        startDate: project.startDate,
        completionDate: project.completionDate,
        narrativeDescription: project.narrativeDescription || ''
      };

      const summary = await generateProjectSummary(summaryData);
      
      return {
        id: project.id,
        name: project.name,
        progress: project.progress || 0,
        status: project.status,
        client: project.client ? project.client.name : 'No Client',
        budgetUtilization: budgetUtilization,
        totalBudget: formatCurrency(project.totalBudget || 0),
        completionDate: project.completionDate,
        summary
      };
    }));

    return res.status(200).json({
      success: true,
      data: {
        projectStatusData,
        projectTimelineData,
        projectSummaries: formattedSummaries
      }
    });
  } catch (error) {
    logger.error('Error generating project summary reports:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate project summary reports',
      error: error.message
    });
  }
};

/**
 * Get budget analysis reports
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Budget analysis report data
 */
const getBudgetAnalysisReports = async (req, res) => {
  try {
    // Get budget utilization trends
    const budgetTrends = await Project.findAll({
      attributes: [
        'id',
        'name',
        'totalBudget',
        'progress'
      ],
      where: {
        deletedAt: null
      },
      limit: 10,
      order: [['updatedAt', 'DESC']]
    });

    // Calculate budget utilization for each project
    const budgetUtilizationData = budgetTrends.map(project => {
      const usedBudget = (project.totalBudget || 0) * ((project.progress || 0) / 100);
      return {
        id: project.id,
        name: project.name || 'Unnamed Project',
        totalBudget: project.totalBudget || 0,
        usedBudget: usedBudget,
        utilizationPercentage: project.totalBudget ? Math.round((usedBudget / project.totalBudget) * 100) : 0
      };
    });

    // Get expense distribution by category
    const expenseDistribution = await Expense.findAll({
      attributes: [
        'category',
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalAmount']
      ],
      group: ['category']
      // No deletedAt filter since Expense model doesn't have paranoid: true
    });

    // Get AI budget analysis
    // For demo, we'll just return static data for now
    const budgetAnalysis = {
      budgetEfficiency: 85,
      costSavingOpportunities: 7800,
      recommendations: [
        {
          project: 'Mobile App Development',
          description: 'Optimize cloud infrastructure',
          potentialSavings: 4200
        },
        {
          project: 'All Projects',
          description: 'Consolidate software licenses',
          potentialSavings: 2100
        },
        {
          project: 'Marketing Campaign',
          description: 'Streamline content creation workflows',
          potentialSavings: 1500
        }
      ]
    };

    return res.status(200).json({
      success: true,
      data: {
        budgetUtilizationData,
        expenseDistribution,
        budgetAnalysis
      }
    });
  } catch (error) {
    logger.error('Error generating budget analysis reports:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate budget analysis reports',
      error: error.message
    });
  }
};

/**
 * Get team performance reports
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Team performance report data
 */
const getTeamPerformanceReports = async (req, res) => {
  try {
    // Get all users first
    const users = await User.findAll({
      attributes: ['id', 'firstName', 'lastName']
    });
    
    // Get active tasks for each user
    const teamUtilizationData = await Promise.all(users.map(async (user) => {
      // Find tasks assigned to this user that are not done
      const tasks = await Task.findAll({
        attributes: ['id', 'projectId'],
        where: {
          assigneeId: user.id,
          status: {
            [Op.not]: 'Done'
          }
        }
      });
      
      // Add tasks to user object
      user.assignedTasks = tasks;
      return user;
    }));

    // Format team utilization data
    const formattedTeamData = teamUtilizationData.map(user => {
      const projectIds = new Set();
      user.assignedTasks.forEach(task => {
        if (task.projectId) {
          projectIds.add(task.projectId);
        }
      });

      return {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        assignedTasksCount: user.assignedTasks.length,
        projectsCount: projectIds.size,
        projects: Array.from(projectIds)
      };
    });

    // Get productivity metrics
    // For demo, we'll use static data for now
    const productivityMetrics = {
      overall: 92,
      trend: [
        { month: 'Jan', productivity: 85 },
        { month: 'Feb', productivity: 88 },
        { month: 'Mar', productivity: 90 },
        { month: 'Apr', productivity: 92 }
      ],
      teamMembers: formattedTeamData.map(member => ({
        id: member.id,
        name: member.name,
        productivity: 85 + Math.floor(Math.random() * 15) // Random productivity score between 85-100
      }))
    };

    // AI-generated team performance analysis
    const teamAnalysis = {
      resourceAllocation: {
        overallocatedMembers: formattedTeamData
          .filter(member => member.assignedTasksCount > 10 || member.projectsCount > 2)
          .map(member => member.name),
        underutilizedMembers: formattedTeamData
          .filter(member => member.assignedTasksCount < 3 && member.projectsCount < 2)
          .map(member => member.name),
        recommendation: "Redistribute tasks to balance workload across team members."
      },
      skillGapAnalysis: {
        identifiedGaps: ["Backend Development", "API Integration", "Database Optimization"],
        recommendation: "Consider upskilling team members or bringing in specialized contractors for critical phases."
      }
    };

    return res.status(200).json({
      success: true,
      data: {
        teamUtilization: formattedTeamData,
        productivityMetrics,
        teamAnalysis
      }
    });
  } catch (error) {
    logger.error('Error generating team performance reports:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate team performance reports',
      error: error.message
    });
  }
};

/**
 * Get AI insight reports
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} AI-generated insight data
 */
const getAIInsightReports = async (req, res) => {
  try {
    // Get project data for AI analysis
    const projects = await Project.findAll({
      attributes: [
        'id',
        'name',
        'status',
        'progress',
        'totalBudget',
        'startDate',
        'completionDate',
        'createdAt',
        'updatedAt'
      ],
      where: {
        deletedAt: null
      },
      include: [
        {
          model: Task,
          as: 'tasks',
          attributes: ['id', 'status'],
          required: false
        },
        {
          model: Expense,
          as: 'expenses',
          attributes: ['id', 'amount'],
          required: false
        }
      ]
    });

    // Format projects for AI analysis
    const formattedProjects = projects.map(project => {
      const totalExpenses = project.expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const budgetUtilization = Math.round((totalExpenses / project.totalBudget) * 100);
      const completedTasks = project.tasks.filter(task => task.status === 'Completed').length;
      const totalTasks = project.tasks.length;
      
      return {
        id: project.id,
        name: project.name,
        status: project.status,
        progress: project.progress,
        budgetUtilization,
        totalBudget: project.totalBudget,
        totalExpenses,
        taskCompletion: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        startDate: project.startDate,
        completionDate: project.completionDate
      };
    });

    // Use AI service to generate insights
    let aiInsights = { projectRiskAssessment: [], performancePrediction: {}, strategicRecommendations: [] };
    
    if (formattedProjects.length > 0) {
      // Get AI-generated insights for the most active projects
      const topProjects = formattedProjects.slice(0, 3); // Focus on top 3 projects
      
      // Generate AI insights using our new service
      const insights = await Promise.all(topProjects.map(project => generateAIInsights(project)));
      
      // Process the insights into our expected format
      aiInsights = {
        projectRiskAssessment: topProjects.map((project, index) => {
          // Find risk insights from AI service
          const riskInsight = insights[index].find(i => i.category === 'Timeline' || i.type === 'Warning') || 
            { type: 'Informational', message: 'No significant risks detected' };
            
          return {
            projectName: project.name,
            riskLevel: riskInsight.type === 'Critical' ? 'High' : 
                      riskInsight.type === 'Warning' ? 'Medium' : 'Low',
            budgetOverrunProbability: project.budgetUtilization > 80 ? 75 : 
                                    project.budgetUtilization > 60 ? 30 : 15,
            timelineSlippageProbability: project.progress < 50 && 
                                     new Date(project.completionDate) < new Date(new Date().setDate(new Date().getDate() + 30)) ? 
                                     40 : 20,
            recommendation: riskInsight.recommendation || 'Monitor progress closely'
          };
        }),
        
        performancePrediction: {
          deadlineMeetingProjects: formattedProjects.filter(p => 
            p.progress > 70 || 
            (p.progress > 50 && new Date(p.completionDate) > new Date(new Date().setDate(new Date().getDate() + 60)))
          ).length,
          totalActiveProjects: formattedProjects.length,
          projectedBudgetVariance: Math.round(formattedProjects.reduce((sum, p) => sum + (p.budgetUtilization - p.progress), 0) / formattedProjects.length),
          productivityIncrease: 8,
          projectionDetails: topProjects.map(project => ({
            projectName: project.name,
            timelineProjection: project.progress < 50 && new Date(project.completionDate) < new Date(new Date().setDate(new Date().getDate() + 30)) ?
                              "1 week extension likely" : "On schedule",
            budgetProjection: project.budgetUtilization > project.progress + 10 ?
                            `${project.budgetUtilization - project.progress}% over budget` : "Within 5% of budget"
          }))
        },
        
        strategicRecommendations: insights.flat()
          .filter(i => i.type !== 'Critical')
          .slice(0, 4)
          .map(insight => ({
            recommendation: insight.message,
            benefit: insight.recommendation,
            priority: insight.type === 'Warning' ? 'High' : 
                     insight.type === 'Positive' ? 'Medium' : 'Low'
          }))
      };
    }

    return res.status(200).json({
      success: true,
      data: {
        projectData: formattedProjects,
        aiInsights
      }
    });
  } catch (error) {
    logger.error('Error generating AI insight reports:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate AI insight reports',
      error: error.message
    });
  }
};

/**
 * Export reports in various formats
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Export status
 */
const exportReports = async (req, res) => {
  try {
    const { reportType, format, projectId } = req.body;
    let reportData; // <-- will hold { success: boolean, data: {...} }

    switch (reportType) {
      case 'summary': {
        // We will capture whatever getProjectSummaryReports would send
        const summaryCapture = {};
        
        // Fake response that captures the JSON payload into summaryCapture.data
        const fakeRes = {
          status: () => ({
            json: (payload) => {
              summaryCapture.data = payload;
              return { status: 200 };
            }
          }),
          json: (payload) => {
            summaryCapture.data = payload;
          }
        };
        
        // Call the controller. It will do res.status(...).json(...)
        await getProjectSummaryReports(req, fakeRes);
        
        // Now unwrap the inner { success, data } object
        reportData = summaryCapture.data;
        break;
      }

      case 'budget': {
        const budgetCapture = {};
        const fakeRes = {
          status: () => ({
            json: (payload) => {
              budgetCapture.data = payload;
              return { status: 200 };
            }
          }),
          json: (payload) => {
            budgetCapture.data = payload;
          }
        };
        await getBudgetAnalysisReports(req, fakeRes);
        reportData = budgetCapture.data;
        break;
      }

      case 'team': {
        const teamCapture = {};
        const fakeRes = {
          status: () => ({
            json: (payload) => {
              teamCapture.data = payload;
              return { status: 200 };
            }
          }),
          json: (payload) => {
            teamCapture.data = payload;
          }
        };
        await getTeamPerformanceReports(req, fakeRes);
        reportData = teamCapture.data;
        break;
      }

      case 'aiInsights': {
        const aiCapture = {};
        const fakeRes = {
          status: () => ({
            json: (payload) => {
              aiCapture.data = payload;
              return { status: 200 };
            }
          }),
          json: (payload) => {
            aiCapture.data = payload;
          }
        };
        await getAIInsightReports(req, fakeRes);
        reportData = aiCapture.data;
        break;
      }

      case 'comprehensive': {
        if (!projectId) {
          return res.status(400).json({
            success: false,
            message: 'Project ID is required for comprehensive reports'
          });
        }
        // Inject projectId into req.params and rerun the comprehensive controller
        req.params.projectId = projectId;
        
        const compCapture = {};
        const fakeRes = {
          status: () => ({
            json: (payload) => {
              compCapture.data = payload;
              return { status: 200 };
            }
          }),
          json: (payload) => {
            compCapture.data = payload;
          }
        };
        await getProjectComprehensiveReport(req, fakeRes);
        reportData = compCapture.data;
        break;
      }

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
    }

    // At this point, reportData should be the actual { success: Boolean, data: {...} } object
    if (!reportData || reportData.success !== true) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate report data'
      });
    }

    // Everything succeeded—now "export" it (we just return a dummy URL for download)
    const timestamp = Date.now();
    const filename = `${reportType}_${timestamp}.${format}`;

    return res.status(200).json({
      success: true,
      message: `Report exported successfully in ${format} format`,
      downloadUrl: `/api/reports/download/${filename}`,
      data: {
        url: `/api/reports/download/${filename}`
      }
    });
  } catch (error) {
    logger.error('Error exporting reports:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to export reports',
      error: error.message
    });
  }
};

/**
 * Generate a comprehensive report for a specific project
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Comprehensive project report
 */
const getProjectComprehensiveReport = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Get project with all related data except sprints
    const project = await Project.findByPk(projectId, {
      attributes: ['id', 'name', 'startDate', 'completionDate', 'status', 'totalBudget', 'narrativeDescription'],
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'name']
        },
        {
          model: Task,
          as: 'tasks',
          attributes: ['id', 'title', 'description', 'status', 'priority', 'dueDate', 'originalEstimate', 'remainingEstimate'],
          include: [
            {
              model: User,
              as: 'assignee',
              attributes: ['id', 'firstName', 'lastName']
            }
          ]
        },
        {
          model: Expense,
          as: 'expenses',
          attributes: ['id', 'amount', 'description', 'category', 'date', 'paymentStatus']
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });
    
    // Get sprints associated with this project through boards
    const boards = await Board.findAll({
      where: { projectId },
      attributes: ['id'],
      include: [
        {
          model: Sprint,
          as: 'sprints',
          attributes: ['id', 'name', 'startDate', 'endDate', 'status', 'goal']
        }
      ]
    });
    
    // Extract sprints from boards and add to project
    if (project) {
      project.dataValues.sprints = [];
      boards.forEach(board => {
        if (board.sprints && board.sprints.length > 0) {
          project.dataValues.sprints = [...project.dataValues.sprints, ...board.sprints];
        }
      });
    }
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Calculate task statistics
    const taskStats = calculateTaskStatistics(project.tasks);
    
    // Calculate expense statistics
    const expenseStats = calculateExpenseStatistics(project.expenses, project.totalBudget);
    
    // Calculate timeline statistics
    const timelineStats = calculateTimelineStatistics(project);
    
    // Generate AI insights for the project using the new AI service
    const projectData = {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      progress: project.progress || 0,
      totalBudget: project.totalBudget || 0,
      usedBudget: expenseStats.approvedExpenses,
      startDate: project.startDate,
      completionDate: project.completionDate,
      tasks: project.tasks,
      timelineStatus: timelineStats.timelineStatus,
      budgetUtilization: expenseStats.budgetUtilizationPercentage
    };
    
    const aiInsights = await generateAIInsights(projectData);
    
    return res.status(200).json({
      success: true,
      data: {
        projectDetails: {
          id: project.id,
          name: project.name,
          narrativeDescription: project.narrativeDescription || '',
          status: project.status,
          progress: project.progress || 0,
          startDate: project.startDate,
          completionDate: project.completionDate,
          totalBudget: project.totalBudget || 0,
          clientName: project.client ? project.client.name : 'No Client',
          projectManager: project.owner ? 
            `${project.owner.firstName} ${project.owner.lastName}` : 
            'Not Assigned'
        },
        taskStats,
        expenseStats,
        timelineStats,
        aiInsights,
        teamPerformance: generateTeamPerformanceReport(project.tasks)
      }
    });
  } catch (error) {
    logger.error('Error generating comprehensive project report:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate comprehensive project report',
      error: error.message
    });
  }
};

// Helper function to calculate task statistics
const calculateTaskStatistics = (tasks = []) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'Completed').length;
  const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;
  const pendingTasks = tasks.filter(task => task.status === 'Pending').length;
  const overdueTasks = tasks.filter(task => {
    return task.status !== 'Completed' && 
           task.dueDate && 
           new Date(task.dueDate) < new Date();
  }).length;
  
  const highPriorityTasks = tasks.filter(task => task.priority === 'High').length;
  const mediumPriorityTasks = tasks.filter(task => task.priority === 'Medium').length;
  const lowPriorityTasks = tasks.filter(task => task.priority === 'Low').length;
  
  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    pendingTasks,
    overdueTasks,
    completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    priorityDistribution: {
      high: highPriorityTasks,
      medium: mediumPriorityTasks,
      low: lowPriorityTasks
    },
    overdueRate: totalTasks > 0 ? Math.round((overdueTasks / totalTasks) * 100) : 0
  };
};

// Helper function to calculate expense statistics
const calculateExpenseStatistics = (expenses = [], totalBudget = 0) => {
  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const approvedExpenses = expenses
    .filter(expense => expense.status === 'Approved')
    .reduce((sum, expense) => sum + (expense.amount || 0), 0);
  
  const pendingExpenses = expenses
    .filter(expense => expense.status === 'Pending')
    .reduce((sum, expense) => sum + (expense.amount || 0), 0);
  
  const rejectedExpenses = expenses
    .filter(expense => expense.status === 'Rejected')
    .reduce((sum, expense) => sum + (expense.amount || 0), 0);
  
  // Get expense categories
  const categories = {};
  expenses.forEach(expense => {
    const category = expense.category || 'Uncategorized';
    if (!categories[category]) {
      categories[category] = 0;
    }
    categories[category] += expense.amount || 0;
  });
  
  return {
    totalExpenses,
    approvedExpenses,
    pendingExpenses,
    rejectedExpenses,
    remainingBudget: Math.max(0, totalBudget - approvedExpenses),
    budgetUtilizationPercentage: totalBudget > 0 ? Math.round((approvedExpenses / totalBudget) * 100) : 0,
    categoryDistribution: Object.keys(categories).map(category => ({
      category,
      amount: categories[category],
      percentage: totalExpenses > 0 ? Math.round((categories[category] / totalExpenses) * 100) : 0
    }))
  };
};

// Helper function to calculate timeline statistics
const calculateTimelineStatistics = (project) => {
  if (!project) return {};
  
  const today = new Date();
  const startDate = project.startDate ? new Date(project.startDate) : null;
  const completionDate = project.completionDate ? new Date(project.completionDate) : null;
  
  if (!startDate || !completionDate) {
    return {
      timelineStatus: 'Incomplete dates',
      message: 'Project is missing start or completion date'
    };
  }
  
  const totalDuration = Math.ceil((completionDate - startDate) / (1000 * 60 * 60 * 24)); // in days
  const elapsedDuration = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)); // in days
  const remainingDuration = Math.max(0, Math.ceil((completionDate - today) / (1000 * 60 * 60 * 24))); // in days
  
  const timeElapsedPercentage = totalDuration > 0 ? Math.min(100, Math.round((elapsedDuration / totalDuration) * 100)) : 0;
  const progressPercentage = project.progress || 0;
  
  let timelineStatus = 'On Track';
  let message = 'Project is progressing as expected';
  
  if (timeElapsedPercentage > progressPercentage + 10) {
    timelineStatus = 'Behind Schedule';
    message = 'Project progress is lagging behind elapsed time';
  } else if (progressPercentage > timeElapsedPercentage + 10) {
    timelineStatus = 'Ahead of Schedule';
    message = 'Project is progressing faster than expected';
  }
  
  return {
    startDate,
    completionDate,
    totalDuration,
    elapsedDuration,
    remainingDuration,
    timeElapsedPercentage,
    progressPercentage,
    timelineStatus,
    message
  };
};
const generateTeamPerformanceReport = (tasks = []) => {
  const teamMembers = {};
  
  tasks.forEach(task => {
    if (task.assignee) {
      const memberId = task.assignee.id;
      const memberName = `${task.assignee.firstName} ${task.assignee.lastName}`;
      
      if (!teamMembers[memberId]) {
        teamMembers[memberId] = {
          id: memberId,
          name: memberName,
          totalTasks: 0,
          completedTasks: 0,
          overdueTasks: 0
        };
      }
      
      teamMembers[memberId].totalTasks++;
      
      if (task.status === 'Completed') {
        teamMembers[memberId].completedTasks++;
      }
      
      if (task.status !== 'Completed' && task.dueDate && new Date(task.dueDate) < new Date()) {
        teamMembers[memberId].overdueTasks++;
      }
    }
  });
  
  // Convert to array and calculate performance metrics
  return Object.values(teamMembers).map(member => {
    return {
      ...member,
      completionRate: member.totalTasks > 0 ? Math.round((member.completedTasks / member.totalTasks) * 100) : 0,
      overdueRate: member.totalTasks > 0 ? Math.round((member.overdueTasks / member.totalTasks) * 100) : 0,
      performanceRating: calculatePerformanceRating(member)
    };
  });
};

// Helper function to calculate performance rating
const calculatePerformanceRating = (member) => {
  if (member.totalTasks === 0) return 'N/A';
  
  const completionRate = member.totalTasks > 0 ? (member.completedTasks / member.totalTasks) * 100 : 0;
  const overdueRate = member.totalTasks > 0 ? (member.overdueTasks / member.totalTasks) * 100 : 0;
  
  // Simple algorithm for performance rating
  let rating = completionRate - (overdueRate * 0.5);
  
  if (rating >= 90) return 'Excellent';
  if (rating >= 75) return 'Good';
  if (rating >= 60) return 'Satisfactory';
  if (rating >= 40) return 'Needs Improvement';
  return 'Unsatisfactory';
};

/**
 * Download an exported report
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const downloadReport = async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Extract report type and format from filename
    // Format: reportType_timestamp.format
    const filenameParts = filename.split('.');
    const format = filenameParts.pop().toLowerCase(); // Get the extension (pdf, csv, excel)
    const reportTypeWithTimestamp = filenameParts.join('.'); // In case there were other dots
    const reportType = reportTypeWithTimestamp.split('_')[0]; // Extract report type
    
    // Set content type based on format
    let contentType;
    switch (format) {
      case 'pdf':
        contentType = 'application/pdf';
        break;
      case 'csv':
        contentType = 'text/csv';
        break;
      case 'excel':
      case 'xlsx':
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Unsupported format'
        });
    }
    
    // Set headers before sending any content
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    
    // Get report data based on report type
    let reportData;
    try {
      switch (reportType) {
        case 'summary':
          reportData = await generateSummaryReportData();
          break;
        case 'budget':
          reportData = await generateBudgetReportData();
          break;
        case 'team':
          reportData = await generateTeamReportData();
          break;
        case 'aiInsights':
          reportData = await generateAIInsightsReportData();
          break;
        case 'comprehensive':
          // Extract projectId from filename if available
          // The filename format should be: comprehensive_projectId_timestamp.pdf
          const projectIdMatch = filename.match(/comprehensive_([^_]+)_/);
          const projectId = projectIdMatch ? projectIdMatch[1] : null;
          
          if (!projectId) {
            logger.warn('No project ID found in comprehensive report filename:', filename);
          } else {
            logger.info(`Generating comprehensive report for project ID: ${projectId}`);
          }
          
          reportData = await generateComprehensiveReportData(projectId);
          break;
        default:
          reportData = { title: 'Generic Report', data: 'No specific report type found' };
      }
    } catch (dataError) {
      logger.error('Error generating report data:', dataError);
      reportData = { title: `${reportType.toUpperCase()} Report`, error: 'Failed to generate report data' };
    }
    
    // Generate and send content based on format
    switch (format) {
      case 'pdf':
        // For PDF, we need to stream the content directly
        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument({ margin: 50 });
        
        // Pipe the PDF directly to the response
        doc.pipe(res);
        
        // Add content to the PDF
        generatePDFDocument(doc, reportData, reportType);
        
        // Finalize the PDF and end the stream
        doc.end();
        break;
        
      case 'csv':
        // For CSV, we can just send the string
        const csvContent = generateCSVContent(reportData, reportType);
        res.send(csvContent);
        break;
        
      case 'excel':
      case 'xlsx':
        // For Excel, we send the buffer
        const excelContent = generateExcelContent(reportData, reportType);
        res.send(excelContent);
        break;
    }
  } catch (error) {
    logger.error('Error downloading report:', error);
    
    // Only send error response if headers haven't been sent yet
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to download report',
        error: error.message
      });
    }
  }
};

/**
 * Generate PDF document using PDFKit
 * @param {PDFDocument} doc - PDFKit document instance
 * @param {Object} reportData - The report data
 * @param {String} reportType - The type of report
 */
const generatePDFDocument = (doc, reportData, reportType) => {
  const title = reportData.title || `${reportType.toUpperCase()} Report`;
  const date = new Date().toLocaleDateString();
  
  // Add title and date
  doc.fontSize(20).text(title, { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Generated on: ${date}`, { align: 'center' });
  doc.moveDown();
  
  // Add horizontal line
  doc.moveTo(50, doc.y)
     .lineTo(doc.page.width - 50, doc.y)
     .stroke();
  doc.moveDown();
  
  // Add report-specific content
  if (reportType === 'summary') {
    doc.fontSize(16).text('Project Summary Report');
    doc.moveDown();
    
    doc.fontSize(12).text(`Total Projects: ${reportData.totalProjects || 0}`);
    doc.text(`Active Projects: ${reportData.activeProjects || 0}`);
    doc.text(`Completed Projects: ${reportData.completedProjects || 0}`);
    doc.moveDown();
    
    doc.fontSize(14).text('Budget Overview:');
    doc.fontSize(12).text(`Total Budget: $${formatCurrency(reportData.totalBudget || 0)}`);
    doc.text(`Spent Budget: $${formatCurrency(reportData.spentBudget || 0)}`);
    doc.text(`Remaining: $${formatCurrency(reportData.remainingBudget || 0)}`);
  } 
  else if (reportType === 'budget') {
    doc.fontSize(16).text('Budget Analysis Report');
    doc.moveDown();
    
    doc.fontSize(12).text(`Budget Utilization: ${reportData.budgetUtilization || 0}%`);
    doc.text(`Over Budget Projects: ${reportData.overBudgetProjects || 0}`);
    doc.text(`Under Budget Projects: ${reportData.underBudgetProjects || 0}`);
    doc.moveDown();
    
    doc.fontSize(14).text('Top Expenses:');
    if (reportData.topExpenses && reportData.topExpenses.length > 0) {
      reportData.topExpenses.forEach(expense => {
        doc.fontSize(12).text(`• ${expense.category}: $${formatCurrency(expense.amount)}`);
      });
    } else {
      doc.fontSize(12).text('None');
    }
  } 
  else if (reportType === 'team') {
    doc.fontSize(16).text('Team Performance Report');
    doc.moveDown();
    
    doc.fontSize(12).text(`Team Members: ${reportData.teamMembers || 0}`);
    doc.text(`Tasks Completed: ${reportData.tasksCompleted || 0}`);
    doc.text(`Average Completion Rate: ${reportData.avgCompletionRate || 0}%`);
    doc.moveDown();
    
    doc.fontSize(14).text('Top Performers:');
    if (reportData.topPerformers && reportData.topPerformers.length > 0) {
      reportData.topPerformers.forEach(performer => {
        doc.fontSize(12).text(`• ${performer.name}: ${performer.tasksCompleted} tasks`);
      });
    } else {
      doc.fontSize(12).text('None');
    }
  } 
  else if (reportType === 'aiInsights') {
    doc.fontSize(16).text('AI Strategic Insights Report');
    doc.moveDown();
    
    doc.fontSize(14).text('Key Insights:');
    if (reportData.insights && reportData.insights.length > 0) {
      reportData.insights.forEach(insight => {
        doc.fontSize(12).text(`• ${insight}`);
      });
    } else {
      doc.fontSize(12).text('No insights available');
    }
    doc.moveDown();
    
    doc.fontSize(14).text('Risk Assessment:');
    if (reportData.risks && reportData.risks.length > 0) {
      reportData.risks.forEach(risk => {
        doc.fontSize(12).text(`• ${risk.description} (Impact: ${risk.impact})`);
      });
    } else {
      doc.fontSize(12).text('No risks identified');
    }
    doc.moveDown();
    
    doc.fontSize(14).text('Recommendations:');
    if (reportData.recommendations && reportData.recommendations.length > 0) {
      reportData.recommendations.forEach(recommendation => {
        doc.fontSize(12).text(`• ${recommendation}`);
      });
    } else {
      doc.fontSize(12).text('No recommendations available');
    }
  } 
  else if (reportType === 'comprehensive') {
    doc.fontSize(16).text('Comprehensive Project Report');
    doc.moveDown();
    
    doc.fontSize(14).text('Project Details:');
    doc.fontSize(12).text(`Project: ${reportData.projectDetails?.name || 'Unknown'}`);
    doc.text(`Status: ${reportData.projectDetails?.status || 'Unknown'}`);
    doc.text(`Progress: ${reportData.projectDetails?.progress || 0}%`);
    doc.moveDown();
    
    doc.fontSize(14).text('Budget:');
    doc.fontSize(12).text(`Total: $${formatCurrency(reportData.projectDetails?.totalBudget || 0)}`);
    doc.text(`Used: $${formatCurrency(reportData.expenseStats?.approvedExpenses || 0)}`);
    doc.text(`Remaining: $${formatCurrency(reportData.expenseStats?.remainingBudget || 0)}`);
    doc.moveDown();
    
    doc.fontSize(14).text('Tasks:');
    doc.fontSize(12).text(`Total: ${reportData.taskStats?.totalTasks || 0}`);
    doc.text(`Completed: ${reportData.taskStats?.completedTasks || 0}`);
    doc.text(`In Progress: ${reportData.taskStats?.inProgressTasks || 0}`);
    doc.text(`Blocked: ${reportData.taskStats?.blockedTasks || 0}`);
    doc.moveDown();
    
    doc.fontSize(14).text('Timeline:');
    doc.fontSize(12).text(`Start Date: ${reportData.projectDetails?.startDate || 'Not set'}`);
    doc.text(`End Date: ${reportData.projectDetails?.completionDate || 'Not set'}`);
    doc.text(`Status: ${reportData.timelineStats?.timelineStatus || 'Unknown'}`);
    doc.moveDown();
    
    doc.fontSize(14).text('AI Insights:');
    doc.fontSize(12).text(reportData.aiInsights?.summary || 'No AI insights available');
  } 
  else {
    doc.fontSize(16).text('Generic Report');
    doc.moveDown();
    doc.fontSize(12).text('No specific data available for this report type.');
  }
  
  // Add footer
  doc.moveDown(2);
  doc.moveTo(50, doc.y)
     .lineTo(doc.page.width - 50, doc.y)
     .stroke();
  doc.moveDown();
  doc.fontSize(10).text('Budget Project Management System', { align: 'center' });
  doc.text('This report is for informational purposes only.', { align: 'center' });
};

/**
 * Generate CSV content for a report
 * @param {Object} reportData - The report data
 * @param {String} reportType - The type of report
 * @returns {String} CSV content as string
 */
const generateCSVContent = (reportData, reportType) => {
  let csvContent = '';
  
  // Generate CSV based on report type
  if (reportType === 'summary') {
    csvContent = 'Metric,Value\n';
    csvContent += `Total Projects,${reportData.totalProjects || 0}\n`;
    csvContent += `Active Projects,${reportData.activeProjects || 0}\n`;
    csvContent += `Completed Projects,${reportData.completedProjects || 0}\n`;
    csvContent += `Total Budget,$${reportData.totalBudget || 0}\n`;
    csvContent += `Spent Budget,$${reportData.spentBudget || 0}\n`;
    csvContent += `Remaining Budget,$${reportData.remainingBudget || 0}\n`;
  } else if (reportType === 'budget') {
    csvContent = 'Category,Amount\n';
    if (reportData.topExpenses && reportData.topExpenses.length > 0) {
      reportData.topExpenses.forEach(expense => {
        csvContent += `${expense.category},$${expense.amount}\n`;
      });
    }
  } else if (reportType === 'team') {
    csvContent = 'Team Member,Tasks Completed,Completion Rate\n';
    if (reportData.topPerformers && reportData.topPerformers.length > 0) {
      reportData.topPerformers.forEach(performer => {
        csvContent += `${performer.name},${performer.tasksCompleted},${performer.completionRate}%\n`;
      });
    }
  } else if (reportType === 'comprehensive' && reportData.projectDetails) {
    // Project details
    csvContent = 'Project Details\n';
    csvContent += 'Name,Status,Progress,Start Date,End Date,Total Budget\n';
    csvContent += `${reportData.projectDetails.name || ''},${reportData.projectDetails.status || ''},${reportData.projectDetails.progress || 0}%,${reportData.projectDetails.startDate || ''},${reportData.projectDetails.completionDate || ''},$${reportData.projectDetails.totalBudget || 0}\n\n`;
    
    // Task statistics
    csvContent += 'Task Statistics\n';
    csvContent += 'Total,Completed,In Progress,Blocked\n';
    csvContent += `${reportData.taskStats?.totalTasks || 0},${reportData.taskStats?.completedTasks || 0},${reportData.taskStats?.inProgressTasks || 0},${reportData.taskStats?.blockedTasks || 0}\n\n`;
    
    // Expense statistics
    csvContent += 'Budget Statistics\n';
    csvContent += 'Total Budget,Used Budget,Remaining Budget,Utilization\n';
    csvContent += `$${reportData.projectDetails.totalBudget || 0},$${reportData.expenseStats?.approvedExpenses || 0},$${reportData.expenseStats?.remainingBudget || 0},${reportData.expenseStats?.budgetUtilizationPercentage || 0}%\n`;
  } else {
    csvContent = 'No specific data available for this report type in CSV format.';
  }
  
  return csvContent;
};

/**
 * Generate Excel content for a report
 * @param {Object} reportData - The report data
 * @param {String} reportType - The type of report
 * @returns {Buffer} Excel content as buffer
 */
const generateExcelContent = (reportData, reportType) => {
  // In a real implementation, you would use a library like exceljs
  // For this demo, we'll just return the CSV content in a buffer
  const csvContent = generateCSVContent(reportData, reportType);
  return Buffer.from(csvContent);
};

/**
 * Generate summary report data
 * @returns {Object} Summary report data
 */
const generateSummaryReportData = async () => {
  try {
    // Get project statistics
    const totalProjects = await Project.count();
    const activeProjects = await Project.count({ where: { status: { [Op.ne]: 'Completed' } } });
    const completedProjects = await Project.count({ where: { status: 'Completed' } });
    
    // Get budget statistics
    const projects = await Project.findAll({
      attributes: ['totalBudget'],
      include: [{
        model: Expense,
        as: 'expenses',
        attributes: ['amount', 'paymentStatus']
      }]
    });
    
    let totalBudget = 0;
    let spentBudget = 0;
    
    projects.forEach(project => {
      totalBudget += project.totalBudget || 0;
      if (project.expenses && project.expenses.length > 0) {
        project.expenses.forEach(expense => {
          if (expense.paymentStatus === 'Approved' || expense.paymentStatus === 'Paid') {
            spentBudget += expense.amount || 0;
          }
        });
      }
    });
    
    const remainingBudget = totalBudget - spentBudget;
    
    return {
      title: 'Project Summary Report',
      totalProjects,
      activeProjects,
      completedProjects,
      totalBudget,
      spentBudget,
      remainingBudget
    };
  } catch (error) {
    logger.error('Error generating summary report data:', error);
    return { title: 'Project Summary Report', error: 'Failed to generate report data' };
  }
};

/**
 * Generate budget report data
 * @returns {Object} Budget report data
 */
const generateBudgetReportData = async () => {
  try {
    // Get budget statistics from existing function
    const budgetAnalysis = await getBudgetAnalysisReportsData();
    return {
      title: 'Budget Analysis Report',
      ...budgetAnalysis.data
    };
  } catch (error) {
    logger.error('Error generating budget report data:', error);
    return { title: 'Budget Analysis Report', error: 'Failed to generate report data' };
  }
};

/**
 * Generate team report data
 * @returns {Object} Team report data
 */
const generateTeamReportData = async () => {
  try {
    // Get team statistics from existing function
    const teamPerformance = await getTeamPerformanceReportsData();
    return {
      title: 'Team Performance Report',
      ...teamPerformance.data
    };
  } catch (error) {
    logger.error('Error generating team report data:', error);
    return { title: 'Team Performance Report', error: 'Failed to generate report data' };
  }
};

/**
 * Generate AI insights report data
 * @returns {Object} AI insights report data
 */
const generateAIInsightsReportData = async () => {
  try {
    // Get AI insights from existing function
    const aiInsights = await getAIInsightReportsData();
    return {
      title: 'AI Strategic Insights Report',
      ...aiInsights.data
    };
  } catch (error) {
    logger.error('Error generating AI insights report data:', error);
    return { title: 'AI Strategic Insights Report', error: 'Failed to generate report data' };
  }
};

/**
 * Get comprehensive report data for a project (helper function for reports)
 * @param {String} projectId - The project ID
 * @returns {Object} Comprehensive project report data
 */
const getProjectComprehensiveReportData = async (projectId) => {
  try {
    if (!projectId) {
      return { 
        data: {
          projectDetails: {
            name: 'Unknown',
            status: 'Unknown',
            progress: 0,
            totalBudget: 0,
            usedBudget: 0,
            remainingBudget: 0
          },
          taskStats: {
            totalTasks: 0,
            completedTasks: 0,
            inProgressTasks: 0,
            blockedTasks: 0
          },
          timelineStats: {
            startDate: null,
            endDate: null,
            timelineStatus: 'Unknown'
          },
          aiInsights: [],
          teamPerformance: []
        }
      };
    }
    
    // Get project with all related data except sprints
    const project = await Project.findByPk(projectId, {
      attributes: ['id', 'name', 'startDate', 'completionDate', 'status', 'totalBudget', 'narrativeDescription'],
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'name']
        },
        {
          model: Task,
          as: 'tasks',
          attributes: ['id', 'title', 'description', 'status', 'priority', 'dueDate', 'originalEstimate', 'remainingEstimate'],
          include: [
            {
              model: User,
              as: 'assignee',
              attributes: ['id', 'firstName', 'lastName']
            }
          ]
        },
        {
          model: Expense,
          as: 'expenses',
          attributes: ['id', 'amount', 'description', 'category', 'date', 'paymentStatus']
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });
    
    if (!project) {
      logger.warn(`Project not found with ID: ${projectId}`);
      return { 
        data: {
          projectDetails: {
            name: 'Project Not Found',
            status: 'Unknown',
            progress: 0,
            totalBudget: 0,
            usedBudget: 0,
            remainingBudget: 0
          },
          taskStats: {
            totalTasks: 0,
            completedTasks: 0,
            inProgressTasks: 0,
            blockedTasks: 0
          },
          timelineStats: {
            startDate: null,
            endDate: null,
            timelineStatus: 'Unknown'
          },
          aiInsights: [],
          teamPerformance: []
        }
      };
    }
    
    // Calculate task statistics
    const taskStats = calculateTaskStatistics(project.tasks);
    
    // Calculate expense statistics
    const expenseStats = calculateExpenseStatistics(project.expenses, project.totalBudget);
    
    // Calculate timeline statistics
    const timelineStats = calculateTimelineStatistics(project);
    
    // Generate AI insights for the project
    const projectData = {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      progress: project.progress || 0,
      totalBudget: project.totalBudget || 0,
      usedBudget: expenseStats.approvedExpenses,
      startDate: project.startDate,
      completionDate: project.completionDate,
      tasks: project.tasks,
      timelineStatus: timelineStats.timelineStatus,
      budgetUtilization: expenseStats.budgetUtilizationPercentage
    };
    
    const aiInsights = await generateAIInsights(projectData);
    
    return {
      data: {
        projectDetails: {
          id: project.id,
          name: project.name,
          narrativeDescription: project.narrativeDescription || '',
          status: project.status,
          progress: project.progress || 0,
          startDate: project.startDate,
          completionDate: project.completionDate,
          totalBudget: project.totalBudget || 0,
          clientName: project.client ? project.client.name : 'No Client',
          projectManager: project.owner ? 
            `${project.owner.firstName} ${project.owner.lastName}` : 
            'Not Assigned'
        },
        taskStats,
        expenseStats,
        timelineStats,
        aiInsights,
        teamPerformance: generateTeamPerformanceReport(project.tasks)
      }
    };
  } catch (error) {
    logger.error('Error retrieving comprehensive project report data:', error);
    return { 
      data: {
        projectDetails: {
          name: 'Error',
          status: 'Error',
          progress: 0,
          totalBudget: 0,
          usedBudget: 0,
          remainingBudget: 0
        },
        taskStats: {
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          blockedTasks: 0
        },
        timelineStats: {
          startDate: null,
          endDate: null,
          timelineStatus: 'Unknown'
        },
        aiInsights: [],
        teamPerformance: [],
        error: error.message
      }
    };
  }
};

/**
 * Generate comprehensive report data for a project
 * @param {String} projectId - The project ID
 * @returns {Object} Comprehensive report data
 */
const generateComprehensiveReportData = async (projectId) => {
  try {
    if (!projectId) {
      return { title: 'Comprehensive Project Report', error: 'No project ID provided' };
    }
    
    // Use the helper function to get comprehensive report data
    const projectReport = await getProjectComprehensiveReportData(projectId);
    return {
      title: `Comprehensive Report: ${projectReport.data.projectDetails.name}`,
      ...projectReport.data
    };
  } catch (error) {
    logger.error('Error generating comprehensive report data:', error);
    return { title: 'Comprehensive Project Report', error: 'Failed to generate report data' };
  }
};

/**
 * Process risk mitigation form data using Gemini AI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const processRiskMitigationForm = async (req, res) => {
  try {
    const { projectName, riskDescription, projectContext, currentMitigation } = req.body;
    
    if (!projectName || !riskDescription) {
      return res.status(400).json({
        success: false,
        message: 'Project name and risk description are required'
      });
    }
    
    // Import the AI service
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    
    // Initialize Gemini client
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Try with gemini-2.0-flash first, fall back to gemini-pro if needed
    let model;
    try {
      model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    } catch (modelError) {
      logger.warn('Failed to use gemini-2.0-flash, falling back to gemini-pro:', modelError.message);
      model = genAI.getGenerativeModel({ model: "gemini-pro" });
    }
    
    // Create the prompt for the AI
    const prompt = `
      You are an expert project risk management advisor. Please analyze the following risk scenario and provide a detailed risk mitigation plan:
      
      Project Name: ${projectName}
      
      Risk Description: ${riskDescription}
      
      ${projectContext ? `Project Context: ${projectContext}` : ''}
      
      ${currentMitigation ? `Current Mitigation Efforts: ${currentMitigation}` : ''}
      
      Please provide a comprehensive risk mitigation plan in the following JSON format:
      {
        "riskAssessment": {
          "severity": "High|Medium|Low",
          "likelihood": "High|Medium|Low",
          "impact": "Detailed description of potential impact if risk materializes",
          "riskScore": "Numerical score between 1-10"
        },
        "mitigationPlan": {
          "strategy": "Avoidance|Reduction|Transfer|Acceptance",
          "recommendedActions": [
            {
              "action": "Specific action to take",
              "priority": "High|Medium|Low",
              "timeframe": "Immediate|Short-term|Long-term",
              "responsibleParty": "Role responsible for this action"
            }
          ],
          "contingencyPlan": "What to do if the risk materializes despite mitigation efforts"
        },
        "monitoringPlan": {
          "keyIndicators": ["List of indicators to monitor"],
          "monitoringFrequency": "Daily|Weekly|Monthly",
          "triggerPoints": ["Conditions that would trigger escalation"]
        }
      }
      
      Your response must be valid JSON that can be parsed directly.
    `;
    
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
    
    // Parse the JSON response
    let mitigationPlan;
    try {
      // Extract JSON from the response (in case there's additional text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        mitigationPlan = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON found, try to parse the entire response
        mitigationPlan = JSON.parse(text);
      }
      
      // Ensure all required fields are present with default values if missing
      mitigationPlan = {
        riskAssessment: {
          severity: mitigationPlan.riskAssessment?.severity || "Medium",
          likelihood: mitigationPlan.riskAssessment?.likelihood || "Medium",
          impact: mitigationPlan.riskAssessment?.impact || "No impact description provided",
          riskScore: mitigationPlan.riskAssessment?.riskScore || 5
        },
        mitigationPlan: {
          strategy: mitigationPlan.mitigationPlan?.strategy || "Reduction",
          recommendedActions: mitigationPlan.mitigationPlan?.recommendedActions || [
            {
              action: "Review and analyze the risk in more detail",
              priority: "Medium",
              timeframe: "Short-term",
              responsibleParty: "Project Manager"
            }
          ],
          contingencyPlan: mitigationPlan.mitigationPlan?.contingencyPlan || "No contingency plan provided"
        },
        monitoringPlan: {
          keyIndicators: mitigationPlan.monitoringPlan?.keyIndicators || ["Risk status", "Project progress"],
          monitoringFrequency: mitigationPlan.monitoringPlan?.monitoringFrequency || "Weekly",
          triggerPoints: mitigationPlan.monitoringPlan?.triggerPoints || ["Significant change in risk factors"]
        }
      };
      
    } catch (parseError) {
      logger.error('Error parsing Gemini response:', parseError);
      
      // Provide a fallback plan if parsing fails
      mitigationPlan = {
        riskAssessment: {
          severity: "Medium",
          likelihood: "Medium",
          impact: "Unable to analyze impact due to processing error. Please review the risk manually.",
          riskScore: 5
        },
        mitigationPlan: {
          strategy: "Reduction",
          recommendedActions: [
            {
              action: "Conduct a detailed risk assessment workshop",
              priority: "High",
              timeframe: "Immediate",
              responsibleParty: "Project Manager"
            },
            {
              action: "Develop a comprehensive risk management plan",
              priority: "Medium",
              timeframe: "Short-term",
              responsibleParty: "Risk Management Team"
            }
          ],
          contingencyPlan: "Establish a risk response team to address issues as they arise. Document all incidents and actions taken."
        },
        monitoringPlan: {
          keyIndicators: ["Risk status", "Project progress", "Team feedback"],
          monitoringFrequency: "Weekly",
          triggerPoints: ["Any indication of risk materializing", "Project delays", "Budget overruns"]
        }
      };
    }
    
    // Return the mitigation plan
    return res.status(200).json({
      success: true,
      data: {
        projectName,
        riskDescription,
        mitigationPlan
      }
    });
    
  } catch (error) {
    logger.error('Error processing risk mitigation form:', error);
    
    // Return a structured error response
    return res.status(500).json({
      success: false,
      message: 'Failed to process risk mitigation form',
      error: error.message,
      data: {
        projectName: req.body?.projectName || "",
        riskDescription: req.body?.riskDescription || "",
        mitigationPlan: {
          riskAssessment: {
            severity: "Medium",
            likelihood: "Medium",
            impact: "Unable to analyze due to system error",
            riskScore: 5
          },
          mitigationPlan: {
            strategy: "Reduction",
            recommendedActions: [
              {
                action: "Try submitting the form again",
                priority: "High",
                timeframe: "Immediate",
                responsibleParty: "User"
              }
            ],
            contingencyPlan: "Contact system administrator if the error persists"
          },
          monitoringPlan: {
            keyIndicators: ["System status"],
            monitoringFrequency: "Daily",
            triggerPoints: ["Continued system errors"]
          }
        }
      }
    });
  }
};

/**
 * Get detailed performance predictions using Gemini AI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Detailed performance predictions
 */
const getDetailedPredictions = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    logger.info(`Generating detailed predictions for project ${projectId}`);
    
    // Check if we should use test data (for development/testing)
    const useTestData = process.env.USE_TEST_DATA === 'true';
    logger.debug(`Test mode is ${useTestData ? 'enabled' : 'disabled'}`);
    
    if (useTestData) {
      // Use pre-generated test data
      try {
        // Import the test data module from the internal location
        logger.debug('Loading internal test data module');
        const { getSamplePrediction, getSampleProject } = require('../test-data/performance-predictions');
        
        // Get a random prediction from test data (or specific one if projectId ends with a number)
        const lastChar = projectId.slice(-1);
        const predictionIndex = !isNaN(parseInt(lastChar)) ? parseInt(lastChar) % 5 : Math.floor(Math.random() * 5);
        
        logger.debug(`Using prediction index: ${predictionIndex}`);
        const mockPrediction = getSamplePrediction(predictionIndex);
        
        if (!mockPrediction) {
          throw new Error(`Failed to get sample prediction for index ${predictionIndex}`);
        }
        
        // Get project name from database if possible, otherwise use sample name
        let projectName = "Project";
        let currentProgress = 50;
        try {
          const project = await Project.findByPk(projectId, {
            attributes: ['name', 'progress']
          });
          if (project) {
            projectName = project.name;
            currentProgress = project.progress || 0;
          } else {
            const sampleProject = getSampleProject(predictionIndex);
            projectName = sampleProject.name;
            currentProgress = sampleProject.progress;
          }
        } catch (dbError) {
          logger.warn('Error fetching project details for test data:', dbError);
          projectName = `Test Project ${predictionIndex + 1}`;
          currentProgress = 50;
        }
        
        logger.info(`Using test prediction data for project ${projectId} (${projectName}), index: ${predictionIndex}`);
        
        return res.status(200).json({
          success: true,
          data: {
            projectName,
            projectId,
            currentProgress,
            performancePrediction: mockPrediction,
            isTestData: true
          }
        });
      } catch (testDataError) {
        logger.error('Error using test data:', testDataError);
        logger.error('Test data error stack:', testDataError.stack);
        // Fall back to API if test data fails
        logger.info('Falling back to Gemini API due to test data error');
      }
    }
    
    // If not using test data or test data failed, proceed with Gemini API
    
    // Get project data for analysis
    const project = await Project.findByPk(projectId, {
      include: [
        {
          model: Task,
          as: 'tasks',
          attributes: ['id', 'status', 'priority', 'dueDate', 'createdAt', 'updatedAt']
        },
        {
          model: Sprint,
          as: 'sprints',
          attributes: ['id', 'status', 'startDate', 'endDate', 'completedPoints', 'totalPoints']
        },
        {
          model: Expense,
          as: 'expenses',
          attributes: ['id', 'amount', 'date']
        }
      ]
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Calculate project metrics for AI analysis
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(task => task.status === 'Done' || task.status === 'Completed').length;
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    const totalExpenses = project.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const budgetUtilization = project.totalBudget > 0 ? (totalExpenses / project.totalBudget) * 100 : 0;
    
    const now = new Date();
    const startDate = new Date(project.startDate);
    const completionDate = new Date(project.completionDate);
    const totalDuration = completionDate.getTime() - startDate.getTime();
    const elapsedDuration = now.getTime() - startDate.getTime();
    const timeElapsedPercentage = totalDuration > 0 ? (elapsedDuration / totalDuration) * 100 : 0;
    
    // Import the AI service
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    
    // Initialize Gemini client
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Try with gemini-2.0-flash first, fall back to gemini-pro if needed
    let model;
    try {
      model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    } catch (modelError) {
      logger.warn('Failed to use gemini-2.0-flash, falling back to gemini-pro:', modelError.message);
      model = genAI.getGenerativeModel({ model: "gemini-pro" });
    }
    
    // Create the prompt for the AI
    const prompt = `
      You are an expert project performance analyst with advanced predictive capabilities.
      Please analyze the following project data and provide detailed performance predictions:
      
      Project Name: ${project.name}
      Project Status: ${project.status}
      Current Progress: ${project.progress || 0}%
      
      Task Metrics:
      - Total Tasks: ${totalTasks}
      - Completed Tasks: ${completedTasks}
      - Task Completion Rate: ${taskCompletionRate.toFixed(2)}%
      
      Budget Metrics:
      - Total Budget: $${project.totalBudget.toFixed(2)}
      - Current Expenses: $${totalExpenses.toFixed(2)}
      - Budget Utilization: ${budgetUtilization.toFixed(2)}%
      
      Timeline Metrics:
      - Start Date: ${project.startDate}
      - Planned Completion Date: ${project.completionDate}
      - Time Elapsed: ${timeElapsedPercentage.toFixed(2)}%
      
      Please provide a comprehensive performance prediction in the following JSON format:
      {
        "timelinePrediction": {
          "predictedCompletionDate": "YYYY-MM-DD",
          "confidenceLevel": "High|Medium|Low",
          "delayRisk": "High|Medium|Low",
          "predictedDelay": "Number of days (0 if on time)",
          "keyMilestones": [
            {
              "name": "Milestone name",
              "predictedDate": "YYYY-MM-DD",
              "riskFactors": ["List of risk factors"]
            }
          ]
        },
        "budgetPrediction": {
          "predictedFinalCost": "Dollar amount",
          "predictedVariance": "Percentage over/under budget",
          "confidenceLevel": "High|Medium|Low",
          "riskAreas": ["List of budget risk areas"]
        },
        "qualityPrediction": {
          "predictedQualityScore": "1-10 score",
          "confidenceLevel": "High|Medium|Low",
          "potentialIssues": ["List of potential quality issues"]
        },
        "recommendations": [
          {
            "area": "Timeline|Budget|Quality|Resources",
            "recommendation": "Specific recommendation",
            "impact": "High|Medium|Low",
            "effort": "High|Medium|Low"
          }
        ],
        "overallHealthPrediction": {
          "score": "1-10 score",
          "trend": "Improving|Stable|Declining",
          "keyInsights": ["List of key insights about project health"]
        }
      }
      
      Your response must be valid JSON that can be parsed directly.
    `;
    
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
    
    // Parse the JSON response
    let performancePrediction;
    try {
      // Extract JSON from the response (in case there's additional text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        performancePrediction = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON found, try to parse the entire response
        performancePrediction = JSON.parse(text);
      }
      
      // Process prediction data to ensure consistent types
      if (performancePrediction.timelinePrediction) {
        if (typeof performancePrediction.timelinePrediction.predictedDelay === 'string') {
          performancePrediction.timelinePrediction.predictedDelay = parseInt(performancePrediction.timelinePrediction.predictedDelay) || 0;
        }
      }
      
      if (performancePrediction.qualityPrediction) {
        if (typeof performancePrediction.qualityPrediction.predictedQualityScore === 'string') {
          performancePrediction.qualityPrediction.predictedQualityScore = parseInt(performancePrediction.qualityPrediction.predictedQualityScore) || 7;
        }
      }
      
      if (performancePrediction.overallHealthPrediction) {
        if (typeof performancePrediction.overallHealthPrediction.score === 'string') {
          performancePrediction.overallHealthPrediction.score = parseInt(performancePrediction.overallHealthPrediction.score) || 5;
        }
      }
      
      // Ensure all required fields are present with default values if missing
      performancePrediction = {
        timelinePrediction: {
          predictedCompletionDate: performancePrediction.timelinePrediction?.predictedCompletionDate || project.completionDate,
          confidenceLevel: performancePrediction.timelinePrediction?.confidenceLevel || "Medium",
          delayRisk: performancePrediction.timelinePrediction?.delayRisk || "Medium",
          predictedDelay: performancePrediction.timelinePrediction?.predictedDelay || 0,
          keyMilestones: performancePrediction.timelinePrediction?.keyMilestones || []
        },
        budgetPrediction: {
          predictedFinalCost: performancePrediction.budgetPrediction?.predictedFinalCost || project.totalBudget,
          predictedVariance: performancePrediction.budgetPrediction?.predictedVariance || "0%",
          confidenceLevel: performancePrediction.budgetPrediction?.confidenceLevel || "Medium",
          riskAreas: performancePrediction.budgetPrediction?.riskAreas || []
        },
        qualityPrediction: {
          predictedQualityScore: performancePrediction.qualityPrediction?.predictedQualityScore || 7,
          confidenceLevel: performancePrediction.qualityPrediction?.confidenceLevel || "Medium",
          potentialIssues: performancePrediction.qualityPrediction?.potentialIssues || []
        },
        recommendations: performancePrediction.recommendations || [],
        overallHealthPrediction: {
          score: performancePrediction.overallHealthPrediction?.score || 7,
          trend: performancePrediction.overallHealthPrediction?.trend || "Stable",
          keyInsights: performancePrediction.overallHealthPrediction?.keyInsights || []
        }
      };
      
    } catch (parseError) {
      logger.error('Error parsing Gemini response:', parseError);
      logger.debug('Raw response text:', text);
      
      // Provide a fallback prediction if parsing fails
      performancePrediction = {
        timelinePrediction: {
          predictedCompletionDate: project.completionDate,
          confidenceLevel: "Low",
          delayRisk: "Medium",
          predictedDelay: 0,
          keyMilestones: []
        },
        budgetPrediction: {
          predictedFinalCost: project.totalBudget,
          predictedVariance: "0%",
          confidenceLevel: "Low",
          riskAreas: ["Unable to analyze budget risks due to processing error"]
        },
        qualityPrediction: {
          predictedQualityScore: 7,
          confidenceLevel: "Low",
          potentialIssues: ["Unable to analyze quality issues due to processing error"]
        },
        recommendations: [
          {
            area: "General",
            recommendation: "Conduct a detailed project review to assess current status",
            impact: "Medium",
            effort: "Medium"
          }
        ],
        overallHealthPrediction: {
          score: 6,
          trend: "Stable",
          keyInsights: ["Unable to generate detailed insights due to processing error"]
        }
      };
    }
    
    // Return the performance prediction
    return res.status(200).json({
      success: true,
      data: {
        projectName: project.name,
        projectId: project.id,
        currentProgress: project.progress || 0,
        performancePrediction
      }
    });
    
  } catch (error) {
    logger.error('Error generating detailed predictions:', error);
    logger.error('Error stack:', error.stack);
    
    // Return a structured error response
    return res.status(500).json({
      success: false,
      message: 'Failed to generate detailed predictions',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = {
  getProjectSummaryReports,
  getBudgetAnalysisReports,
  getTeamPerformanceReports,
  getAIInsightReports,
  getProjectComprehensiveReport,
  exportReports,
  downloadReport,
  processRiskMitigationForm,
  getDetailedPredictions
};