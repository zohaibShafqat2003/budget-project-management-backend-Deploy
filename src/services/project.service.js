const { Project, Task, Story, Epic, Sprint, Board, sequelize } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');

/**
 * Calculate task completion percentage for a set of tasks
 * @param {Array} tasks - Array of task objects
 * @returns {number} - Completion percentage (0-100)
 */
const calculateTaskCompletion = (tasks) => {
  if (!tasks || tasks.length === 0) return 0;
  
  const completedTasks = tasks.filter(task => 
    task.status === 'Done' || task.status === 'Closed'
  ).length;
  
  return (completedTasks / tasks.length) * 100;
};

/**
 * Calculate story completion percentage based on story points or count
 * @param {Array} stories - Array of story objects
 * @returns {number} - Completion percentage (0-100)
 */
const calculateStoryCompletion = (stories) => {
  if (!stories || stories.length === 0) return 0;
  
  // If we have story points, use them for weighted progress
  const totalStoryPoints = stories.reduce((sum, story) => sum + (story.points || 0), 0);
  
  if (totalStoryPoints > 0) {
    const completedStoryPoints = stories
      .filter(story => story.status === 'Done')
      .reduce((sum, story) => sum + (story.points || 0), 0);
    
    return (completedStoryPoints / totalStoryPoints) * 100;
  } else {
    // If no story points, just count stories
    const completedStories = stories.filter(story => story.status === 'Done').length;
    return (completedStories / stories.length) * 100;
  }
};

/**
 * Calculate sprint progress based on its stories and tasks
 * @param {string} sprintId - Sprint ID
 * @returns {Promise<number>} - Progress percentage (0-100)
 */
const calculateSprintProgress = async (sprintId) => {
  try {
    // Get the sprint with its stories and tasks
    const sprint = await Sprint.findByPk(sprintId, {
      include: [
        { model: Story, as: 'stories', include: [{ model: Task, as: 'tasks' }] },
        { model: Task, as: 'tasks' }
      ]
    });
    
    if (!sprint) {
      logger.error(`Sprint not found: ${sprintId}`);
      return 0;
    }
    
    // Get all stories in the sprint
    const stories = sprint.stories || [];
    
    // Get all tasks directly assigned to the sprint
    const sprintTasks = sprint.tasks || [];
    
    // Get all tasks from stories in the sprint
    const storyTasks = stories.reduce((acc, story) => {
      if (story.tasks && story.tasks.length > 0) {
        acc.push(...story.tasks);
      }
      return acc;
    }, []);
    
    // Combine all tasks
    const allTasks = [...sprintTasks, ...storyTasks];
    
    // Calculate story progress
    const storyProgress = calculateStoryCompletion(stories);
    
    // Calculate task progress
    const taskProgress = calculateTaskCompletion(allTasks);
    
    // Calculate overall sprint progress
    // If we have both stories and tasks, weight stories higher
    let progress = 0;
    if (stories.length > 0 && allTasks.length > 0) {
      progress = (storyProgress * 0.7) + (taskProgress * 0.3);
    } else if (stories.length > 0) {
      progress = storyProgress;
    } else if (allTasks.length > 0) {
      progress = taskProgress;
    }
    
    return Math.round(progress);
  } catch (error) {
    logger.error('Error calculating sprint progress:', error);
    return 0;
  }
};

/**
 * Calculate epic progress based on its stories and tasks
 * @param {string} epicId - Epic ID
 * @returns {Promise<number>} - Progress percentage (0-100)
 */
const calculateEpicProgress = async (epicId) => {
  try {
    // Get the epic with its stories
    const epic = await Epic.findByPk(epicId, {
      include: [
        { model: Story, as: 'stories', include: [{ model: Task, as: 'tasks' }] }
      ]
    });
    
    if (!epic) {
      logger.error(`Epic not found: ${epicId}`);
      return 0;
    }
    
    // Get all stories in the epic
    const stories = epic.stories || [];
    
    // Get all tasks from stories in the epic
    const tasks = stories.reduce((acc, story) => {
      if (story.tasks && story.tasks.length > 0) {
        acc.push(...story.tasks);
      }
      return acc;
    }, []);
    
    // Calculate story progress
    const storyProgress = calculateStoryCompletion(stories);
    
    // Calculate task progress
    const taskProgress = calculateTaskCompletion(tasks);
    
    // Calculate overall epic progress
    // If we have both stories and tasks, weight stories higher
    let progress = 0;
    if (stories.length > 0 && tasks.length > 0) {
      progress = (storyProgress * 0.7) + (taskProgress * 0.3);
    } else if (stories.length > 0) {
      progress = storyProgress;
    } else if (tasks.length > 0) {
      progress = taskProgress;
    }
    
    return Math.round(progress);
  } catch (error) {
    logger.error('Error calculating epic progress:', error);
    return 0;
  }
};

/**
 * Calculate project progress based on sprints, epics, stories, and tasks
 * @param {string} projectId - Project ID
 * @returns {Promise<number>} - Project progress percentage (0-100)
 */
const calculateProjectProgress = async (projectId) => {
  try {
    // Get the project with all related data
    const project = await Project.findByPk(projectId, {
      include: [
        { 
          model: Board, 
          as: 'boards',
          include: [
            { 
              model: Sprint, 
              as: 'sprints',
              include: [
                { model: Story, as: 'stories' },
                { model: Task, as: 'tasks' }
              ]
            }
          ]
        },
        { 
          model: Epic, 
          as: 'epics',
          include: [
            { model: Story, as: 'stories' }
          ]
        },
        { 
          model: Story, 
          as: 'stories',
          include: [
            { model: Task, as: 'tasks' }
          ]
        },
        { model: Task, as: 'tasks' }
      ]
    });

    if (!project) {
      logger.error(`Project not found: ${projectId}`);
      return null;
    }

    // Get all sprints across all boards
    const sprints = project.boards.reduce((acc, board) => {
      if (board.sprints && board.sprints.length > 0) {
        acc.push(...board.sprints);
      }
      return acc;
    }, []);

    // Get all epics
    const epics = project.epics || [];

    // Get all stories (from sprints, epics, and directly from project)
    const sprintStories = sprints.reduce((acc, sprint) => {
      if (sprint.stories && sprint.stories.length > 0) {
        acc.push(...sprint.stories);
      }
      return acc;
    }, []);

    const epicStories = epics.reduce((acc, epic) => {
      if (epic.stories && epic.stories.length > 0) {
        acc.push(...epic.stories);
      }
      return acc;
    }, []);

    const directStories = project.stories || [];

    // Combine all stories, ensuring no duplicates by ID
    const storyMap = new Map();
    [...sprintStories, ...epicStories, ...directStories].forEach(story => {
      if (!storyMap.has(story.id)) {
        storyMap.set(story.id, story);
      }
    });
    const allStories = Array.from(storyMap.values());

    // Get all tasks (from stories, sprints, and directly from project)
    const storyTasks = allStories.reduce((acc, story) => {
      if (story.tasks && story.tasks.length > 0) {
        acc.push(...story.tasks);
      }
      return acc;
    }, []);

    const sprintTasks = sprints.reduce((acc, sprint) => {
      if (sprint.tasks && sprint.tasks.length > 0) {
        acc.push(...sprint.tasks);
      }
      return acc;
    }, []);

    const directTasks = project.tasks || [];

    // Combine all tasks, ensuring no duplicates by ID
    const taskMap = new Map();
    [...storyTasks, ...sprintTasks, ...directTasks].forEach(task => {
      if (!taskMap.has(task.id)) {
        taskMap.set(task.id, task);
      }
    });
    const allTasks = Array.from(taskMap.values());

    // Calculate progress for sprints
    const sprintProgress = sprints.length > 0 ? 
      sprints.reduce((sum, sprint) => {
        // For active sprints, calculate based on stories/tasks
        if (sprint.status === 'Active') {
          const stories = sprint.stories || [];
          const tasks = [...(sprint.tasks || []), ...stories.reduce((acc, story) => {
            if (story.tasks && story.tasks.length > 0) {
              acc.push(...story.tasks);
            }
            return acc;
          }, [])];
          
          const storyCompletion = calculateStoryCompletion(stories);
          const taskCompletion = calculateTaskCompletion(tasks);
          
          let sprintCompletion = 0;
          if (stories.length > 0 && tasks.length > 0) {
            sprintCompletion = (storyCompletion * 0.7) + (taskCompletion * 0.3);
          } else if (stories.length > 0) {
            sprintCompletion = storyCompletion;
          } else if (tasks.length > 0) {
            sprintCompletion = taskCompletion;
          }
          
          return sum + sprintCompletion;
        } 
        // For completed sprints, count as 100%
        else if (sprint.status === 'Completed') {
          return sum + 100;
        } 
        // For planning or cancelled sprints, count as 0%
        else {
          return sum;
        }
      }, 0) / sprints.length : 0;

    // Calculate progress for epics
    const epicProgress = epics.length > 0 ? 
      epics.reduce((sum, epic) => {
        const stories = epic.stories || [];
        const storyCompletion = calculateStoryCompletion(stories);
        return sum + storyCompletion;
      }, 0) / epics.length : 0;

    // Calculate story progress
    const storyProgress = calculateStoryCompletion(allStories);

    // Calculate task progress
    const taskProgress = calculateTaskCompletion(allTasks);

    // Calculate overall project progress with weighted components
    let progress = 0;
    let weightSum = 0;

    // If we have sprints, they get highest weight
    if (sprints.length > 0) {
      progress += sprintProgress * 0.4;
      weightSum += 0.4;
    }

    // If we have epics, they get second highest weight
    if (epics.length > 0) {
      progress += epicProgress * 0.3;
      weightSum += 0.3;
    }

    // If we have stories, they get third highest weight
    if (allStories.length > 0) {
      progress += storyProgress * 0.2;
      weightSum += 0.2;
    }

    // If we have tasks, they get lowest weight
    if (allTasks.length > 0) {
      progress += taskProgress * 0.1;
      weightSum += 0.1;
    }

    // Normalize progress based on actual weights used
    if (weightSum > 0) {
      progress = progress / weightSum;
    } else {
      // If no components, use status-based progress
      switch (project.status) {
        case 'Not Started': progress = 0; break;
        case 'Active': progress = 25; break;
        case 'In Progress': progress = 50; break;
        case 'Review': progress = 80; break;
        case 'Completed': progress = 100; break;
        case 'Archived': progress = 100; break;
        case 'On Hold': progress = project.progress || 0; break;
        default: progress = 0;
      }
    }

    // Round to nearest integer
    return Math.round(progress);
  } catch (error) {
    logger.error('Error calculating project progress:', error);
    return null;
  }
};

/**
 * Update project progress based on completed tasks and stories
 * @param {string} projectId - Project ID
 * @returns {Promise<boolean>} - Success status
 */
const updateProjectProgress = async (projectId) => {
  try {
    const progress = await calculateProjectProgress(projectId);
    
    if (progress !== null) {
      await Project.update(
        { progress },
        { where: { id: projectId } }
      );
      return true;
    }
    
    return false;
  } catch (error) {
    logger.error('Error updating project progress:', error);
    return false;
  }
};

/**
 * Update epic progress based on its stories and tasks
 * @param {string} epicId - Epic ID
 * @returns {Promise<boolean>} - Success status
 */
const updateEpicProgress = async (epicId) => {
  try {
    // Get the epic to find its project
    const epic = await Epic.findByPk(epicId);
    
    if (!epic) {
      logger.error(`Epic not found: ${epicId}`);
      return false;
    }
    
    // Calculate and update epic status based on stories
    const progress = await calculateEpicProgress(epicId);
    let status = epic.status;
    
    // Update status based on progress
    if (progress === 100) {
      status = 'Done';
    } else if (progress > 0) {
      status = 'In Progress';
    } else {
      status = 'To Do';
    }
    
    // Update the epic
    await Epic.update({ status }, { where: { id: epicId } });
    
    // Also update the project progress
    await updateProjectProgress(epic.projectId);
    
    return true;
  } catch (error) {
    logger.error('Error updating epic progress:', error);
    return false;
  }
};

/**
 * Update sprint progress
 * @param {string} sprintId - Sprint ID
 * @returns {Promise<boolean>} - Success status
 */
const updateSprintProgress = async (sprintId) => {
  try {
    // Get the sprint with its board to find the project
    const sprint = await Sprint.findByPk(sprintId, {
      include: [{ model: Board, as: 'board' }]
    });
    
    if (!sprint || !sprint.board) {
      logger.error(`Sprint not found or has no board: ${sprintId}`);
      return false;
    }
    
    // Calculate completed points
    const progress = await calculateSprintProgress(sprintId);
    
    // Calculate completed points based on progress and total points
    const completedPoints = Math.round((progress / 100) * sprint.totalPoints);
    
    // Update the sprint
    await Sprint.update(
      { completedPoints },
      { where: { id: sprintId } }
    );
    
    // Also update the project progress
    await updateProjectProgress(sprint.board.projectId);
    
    return true;
  } catch (error) {
    logger.error('Error updating sprint progress:', error);
    return false;
  }
};

module.exports = {
  calculateProjectProgress,
  updateProjectProgress,
  calculateEpicProgress,
  updateEpicProgress,
  calculateSprintProgress,
  updateSprintProgress
}; 