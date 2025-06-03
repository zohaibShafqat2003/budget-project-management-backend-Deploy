// app.js

// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const logger = require('./config/logger');
const errorHandler = require('./middleware/error.middleware');
const requestLogger = require('./middleware/request-logger.middleware');
const { limiter, authLimiter } = require('./middleware/rate-limit.middleware');
const { authenticateToken } = require('./middleware/auth.middleware');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const projectRoutes = require('./routes/project.routes');
const taskRoutes = require('./routes/task.routes');
const clientRoutes = require('./routes/client.routes');
const epicRoutes = require('./routes/epic.routes');
const storyRoutes = require('./routes/story.routes');
const sprintRoutes = require('./routes/sprint.routes');
const boardRoutes = require('./routes/board.routes');
const budgetRoutes = require('./routes/budget.routes');
const expenseRoutes = require('./routes/expense.routes');
const healthRoutes = require('./routes/health.routes');
const commentRoutes = require('./routes/comment.routes');
const attachmentRoutes = require('./routes/attachment.routes');
const labelRoutes = require('./routes/label.routes');
const searchRoutes = require('./routes/search.routes');
const reportRoutes = require('./routes/report.routes');

// Create Express app
const app = express();

// ────────────────────────────────────────────────────────────────────────────────
//  Security middleware
// ────────────────────────────────────────────────────────────────────────────────
app.use(helmet());

// ────────────────────────────────────────────────────────────────────────────────
//  CORS configuration
// ────────────────────────────────────────────────────────────────────────────────
// Build an array of origins that are allowed to access your backend.
// Include both local-dev and your deployed frontend domain(s).
const allowedOrigins = [
  'http://localhost:3000',
  'https://budget-project-management-frontend-sigma.vercel.app'
];

// CORS options
const corsOptions = {
  origin: function (origin, callback) {
    // If no origin (e.g. mobile/native clients) or origin is in our list, allow it.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Optional: log what origins are allowed (for debugging)
console.log('🔒 CORS configured with allowed origins:', allowedOrigins);
// ────────────────────────────────────────────────────────────────────────────────

// ────────────────────────────────────────────────────────────────────────────────
//  Basic middleware
// ────────────────────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// ────────────────────────────────────────────────────────────────────────────────
//  Logging middleware
// ────────────────────────────────────────────────────────────────────────────────
app.use(requestLogger || morgan('dev')); // Fallback to morgan if requestLogger isn’t defined

// ────────────────────────────────────────────────────────────────────────────────
//  Rate limiting
// ────────────────────────────────────────────────────────────────────────────────
// Stricter rate limit for auth routes
app.use('/api/auth', authLimiter);
// General rate limit for all API routes
app.use('/api', limiter);

// ────────────────────────────────────────────────────────────────────────────────
//  Static files
// ────────────────────────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ────────────────────────────────────────────────────────────────────────────────
//  Unprotected routes (no token required)
// ────────────────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/health', healthRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Budget Project Management API',
    version: '1.0.0',
    status: 'active'
  });
});

// ────────────────────────────────────────────────────────────────────────────────
//  Protected API routes (token required)
// ────────────────────────────────────────────────────────────────────────────────
app.use('/api', authenticateToken);

// Primary entity routes (after authentication)
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/clients', clientRoutes);

// These routes use "/api" prefix, so mount them directly under /api
app.use('/api', taskRoutes);
app.use('/api', budgetRoutes);
app.use('/api', expenseRoutes);
app.use('/api', boardRoutes);
app.use('/api', epicRoutes);
app.use('/api', storyRoutes);
app.use('/api', sprintRoutes);

// Resource-specific endpoints
app.use('/api/comments', commentRoutes);
app.use('/api', attachmentRoutes);
app.use('/api/labels', labelRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/reports', reportRoutes);

// ────────────────────────────────────────────────────────────────────────────────
//  Error handling & 404
// ────────────────────────────────────────────────────────────────────────────────
app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    status: 404
  });
});

// Export the configured Express app
module.exports = app;
